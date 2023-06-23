import {
  getWindowLocationHostname,
  getWindowLocationPort,
  isSecure,
  isDefaultPort,
  isDefaultSecurePort
} from '@sequencemedia/device'

const getSocketProtocol = () => isSecure() ? 'wss' : 'ws'

function getSocketUri () {
  const hasPort = !( // NOT
    isSecure()
      ? isDefaultSecurePort()
      : isDefaultPort()
  )
  const protocol = getSocketProtocol()
  const hostname = getWindowLocationHostname()
  const uri = (
    hasPort
      ? `${protocol}://${hostname}:${getWindowLocationPort()}`
      : `${protocol}://${hostname}`
  )

  return new URL(uri)
}

window.addEventListener('load', function handleLoad () {
  function handleConnect () {
    console.log('connected')

    Array.from(document.getElementsByClassName('event-target'))
      .forEach((element) => {
        element.addEventListener('mousedown', handleMouseDown, false)

        element.addEventListener('mouseup', handleMouseUp, false)

        element.addEventListener('mousemove', handleMouseMove, false)
      })
  }

  function handleDisconnect () {
    console.log('disconnected')

    Array.from(document.getElementsByClassName('event-target'))
      .forEach((element) => {
        element.removeEventListener('mousedown', handleMouseDown, false)

        element.removeEventListener('mouseup', handleMouseUp, false)

        element.removeEventListener('mousemove', handleMouseMove, false)
      })
  }

  function handleMouseDown ({ clientX, clientY }) {
    const message = {
      x: clientX,
      y: clientY
    }

    socket.emit('mousedown', message)

    if (parent !== window) parent.postMessage({ type: 'mousedown', message }, REMOTE_HOST)
  }

  function handleMouseUp ({ clientX, clientY }) {
    const message = {
      x: clientX,
      y: clientY
    }

    socket.emit('mouseup', message)

    if (parent !== window) parent.postMessage({ type: 'mouseup', message }, REMOTE_HOST)
  }

  function handleMouseMove ({ clientX, clientY }) {
    const message = {
      x: clientX,
      y: clientY
    }

    socket.emit('mousemove', message)

    if (parent !== window) parent.postMessage({ type: 'mousemove', message }, REMOTE_HOST)
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

  const {
    RemoteHost: REMOTE_HOST
  } = JSON.parse(document.getElementById('config').textContent)

  window.addEventListener('beforeunload', function handleBeforeUnload () {
    socket.disconnect()
  })
})
