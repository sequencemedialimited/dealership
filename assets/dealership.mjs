const DEFAULT_PORT = 80

const DEFAULT_SECURE_PORT = 443

function getWindowLocationProtocol ({
  location: {
    protocol = 'http'
  } = {}
} = window) {
  return protocol
}

function getWindowLocationHostname ({
  location: {
    hostname = 'localhost'
  } = {}
} = window) {
  return hostname
}

function getWindowLocationPort ({
  location: {
    port = DEFAULT_PORT
  } = {}
} = window) {
  return port
}

function isSecure (context) {
  return (
    getWindowLocationProtocol(context)
      .toLowerCase()
      .startsWith('https')
  )
}

function isDefaultPort (context) {
  const port = String(getWindowLocationPort(context))

  return port === '' || Number(port) === DEFAULT_PORT
}

function isDefaultSecurePort (context) {
  const port = String(getWindowLocationPort(context))

  return port === '' || Number(port) === DEFAULT_SECURE_PORT
}

const getSocketProtocol = () => isSecure() ? 'wss' : 'ws'

function getSocketUri () {
  const hasPort = !( // NOT
    isSecure()
      ? isDefaultSecurePort()
      : isDefaultPort()
  )
  const protocol = getSocketProtocol()
  const hostname = getWindowLocationHostname()

  return (
    hasPort
      ? `${protocol}://${hostname}:${getWindowLocationPort()}`
      : `${protocol}://${hostname}`
  )
}

function handleConnect () {
  console.log('connected')
}

function handleDisconnect () {
  console.log('disconnected')
}

function handleMouseDown ({ clientX, clientY }) {
  const message = {
    x: clientX,
    y: clientY
  }

  socket.emit('mousedown', message)

  if (parent !== window) parent.postMessage({ type: 'mousedown', message }, 'http://localhost')
}

function handleMouseUp ({ clientX, clientY }) {
  const message = {
    x: clientX,
    y: clientY
  }

  socket.emit('mouseup', message)

  if (parent !== window) parent.postMessage({ type: 'mouseup', message }, 'http://localhost')
}

function handleMouseMove ({ clientX, clientY }) {
  const message = {
    x: clientX,
    y: clientY
  }

  socket.emit('mousemove', message)

  if (parent !== window) parent.postMessage({ type: 'mousemove', message }, 'http://localhost')
}

const uri = getSocketUri()
const parameters = {
  secure: isSecure(),
  'sync disconnect on unload': true,
  withCredentials: true
}

const socket = io(uri, parameters)

socket
  .on('connect', handleConnect)
  .on('disconnect', handleDisconnect)

window.addEventListener('beforeunload', () => {
  socket.disconnect()
})

Array.from(document.getElementsByClassName('event-target'))
  .forEach((element) => {
    element.addEventListener('mousedown', handleMouseDown, false)

    element.addEventListener('mouseup', handleMouseUp, false)

    element.addEventListener('mousemove', handleMouseMove, false)
  })
