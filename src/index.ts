import { Hono } from 'hono'
import {proxy} from "./routes/proxy";

type Bindings = {
    ACCESS_TOKEN: string
}
export type HonoWithBindings = Hono<{ Bindings: Bindings }>
const app: HonoWithBindings = new Hono()

app.get('/', (c) => c.json('hi.'))
app.use((c, next) => {
    c.header('X-App-Name', 'Slate')
    return next()
})

proxy(app)

export default app
