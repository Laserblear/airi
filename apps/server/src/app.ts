import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { auth } from './services/auth'

const app = new Hono()

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

serve(app)
