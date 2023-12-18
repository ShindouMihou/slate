import {StatusCodes} from "http-status-codes";
import {HonoWithBindings} from "../index";

export const proxy = (hono: HonoWithBindings) => {
    hono.all('/slate', async (context) => {
        const method = context.req.method
        const headers = context.req.raw.headers

        const forwardToHeader  = headers.get('X-Slate-Forward-To')
        const accessToken = headers.get('X-Slate-Authorization')

        if (accessToken == null) {
            return context.json({ err: 'Missing \'X-Slate-Authorization\' header.' }, StatusCodes.UNAUTHORIZED)
        }

        const expectsBody = headers.get('X-Slate-Expects-Body')?.toLowerCase() === 'true'

        if (accessToken !== context.env.ACCESS_TOKEN) {
            return context.json({ err: 'Invalid \'X-Slate-Authorization\' header value.' }, StatusCodes.UNAUTHORIZED)
        }

        if (forwardToHeader == null) {
            return context.json({ err: 'Missing \'X-Slate-Forward-To\' header.' }, StatusCodes.BAD_REQUEST)
        }

        const headersCopy: any = {}
        headers.forEach((value, key) => {
            const lkey = key.toLowerCase()
            if (lkey.startsWith('x-slate-')) return
            headersCopy[key] = value
        })

        const body = method === 'GET' || method === 'HEAD' ? null : await context.req.text()

        const request = {
            addr: forwardToHeader,
            headers: headersCopy,
            body: body === "" ? null : body
        }

        try {
            const response =  await fetch(forwardToHeader, {
                method,
                headers: headersCopy,
                body: body === "" ? null : body,
                signal: AbortSignal.timeout(3_000)
            })

            const responseHeaders: any = {}
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value
            })

            const responseBody = expectsBody ? await response.text() : null
            return context.json({
                response: {
                    status: response.status,
                    headers: responseHeaders,
                    body: responseBody
                },
                request: request
            }, StatusCodes.OK)
        } catch (ex) {
            //@ts-ignore
            if (ex?.name === 'TimeoutError') {
                return context.json({ error: 'Timeout reached.', request }, StatusCodes.IM_A_TEAPOT)
            }
            console.error(`Failed to proxy request to ${forwardToHeader} due to exception: ${ex}`)
            return context.json({error: ex, request}, StatusCodes.BAD_GATEWAY)
        }
    })
}