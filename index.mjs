import debug from 'debug'
import yargsParser from 'yargs-parser'
import http from 'node:http'
import express from 'express'
import SocketIO from 'socket.io'
import {
  isRequestSocketEncrypted
} from '@sequencemedia/express'

const log = debug('renderapp')

const {
  argv
} = process

const args = new Map(Object.entries(yargsParser(argv.slice(2))))

const app = express()

app.use('/assets', express.static('./public/assets'))
app.use('/favicon.ico', express.static('./public/assets/favicon.ico'))
app.set('views', './views')
app.set('view engine', 'ejs')
app.disable('x-powered-by')

app.get('/', (req, res) => res.redirect(getRemoteHost(req)))

app.get('/dealership', (req, res) => res.render('dealership', { RemoteHost: getRemoteHost(req) }))

app.get('/api/addressalias/:hostname/:address/:token', ({ params: { hostname, address, token } }, res) => {
  log(hostname, address, token)

  res.status(200).json({ hostname, address, token })
})

app.get('/api/getallsettings/:region', ({ params: { region } }, res) => {
  log(region)

  res.status(200).sendFile('./config/AppSettings.json', { root: '.' })
})

app.get('/api/getbackendconfiguration/:region', ({ params: { region } }, res) => {
  log(region)

  res.status(200).json({ region })
})

const DEFAULT_PORT = 80

const PORT = process.env.PORT || args.get('port') || DEFAULT_PORT

const DEFAULT_REMOTE_HOST = 'https://localhost'

const REMOTE_HOST = (args.has('remoteHost')) ? args.get('remoteHost') : DEFAULT_REMOTE_HOST

const io = new SocketIO()

const server = http.Server(app)

function getRemoteHost (req) {
  return (
    isRequestSocketEncrypted(req)
      ? REMOTE_HOST.replace('http://', 'https://')
      : REMOTE_HOST.replace('https://', 'http://')
  )
}

io.attach(server)

io.on('connect', (socket) => {
  socket
    .on('orbitSpeed', (message) => {
      log('Orbit speed:', message)
    })
})

server.listen(PORT, () => {
  log(PORT)
})
