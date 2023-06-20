import yargsParser from 'yargs-parser'
import http from 'node:http'
import https from 'node:https'
import express from 'express'
import SocketIO from 'socket.io'

const {
  argv
} = process

const args = new Map(Object.entries(yargsParser(argv.slice(2))))

const app = express()

app.use('/assets', express.static('assets'))

app.get('/', (req, res) => res.redirect('http://localhost'))

app.get('/dealership', (req, res) => res.sendFile('dealership.html', { root: '.' }))

const PORT = process.env.PORT || args.get('port') || 80
const SECURE_PORT = process.env.SECURE_PORT || args.get('securePort') || 443

const io = new SocketIO()

const server = http.Server(app)
const secureServer = https.Server(app)

io.attach(server)

io.attach(secureServer)

io.on('connect', (socket) => {
  socket
    .on('mousedown', (message) => {
      console.log('mousedown', message)
    })
    .on('mouseup', (message) => {
      console.log('mouseup', message)
    })
    .on('mousemove', (message) => {
      console.log('mousemove', message)
    })
})

server.listen(PORT, () => {
  console.log({ PORT })
})

secureServer.listen(SECURE_PORT, () => {
  console.log({ SECURE_PORT })
})
