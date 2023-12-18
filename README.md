# Slate

A minimal, serverless (Cloudflare Worker) request proxy designed to be used for service webhooks without 
exposing the services' server address. Note that it passes all headers except the ones with the `X-Slate-` prefix 
which are intended for the proxy itself.

## Supported `X-Slate` headers
1. `X-Slate-Authorization`: for authorization, this is the same  value as your `wrangler.toml`'s `ACCESS_TOKEN` variable. **required**
2. `X-Slate-Forwarded-To`: used to tell Slate where to send this request to, should be a valid link. **required**
3. `X-Slate-Expects-Body`: should Slate send back the response body to the service? (default: `false`)

## Routes
1. `GET/PUT/DELETE/POST/HEAD /slate`: the primary proxy route.

## Deploying
1. Clone the repository using `git clone https://github.com/ShindouMihou/slate`
2. Configure the `wrangler.toml`
3. Run `bun run deploy`
