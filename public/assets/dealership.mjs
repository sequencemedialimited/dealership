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
        element.addEventListener('mousedown', handleMouseDown, { capture: true, bubbles: false, passive: true })

        element.addEventListener('mouseup', handleMouseUp, { capture: true, bubbles: false, passive: true })
      })
  }

  function handleDisconnect () {
    console.log('disconnected')

    Array.from(document.getElementsByClassName('event-target'))
      .forEach((element) => {
        element.removeEventListener('mousedown', handleMouseDown, { capture: true, bubbles: false, passive: true })

        element.removeEventListener('mouseup', handleMouseUp, { capture: true, bubbles: false, passive: true })
      })
  }

  let X = 0
  let Y = 0
  const SCROLL_MULTIPLIER = 15

  function getDelta (e = {}) {
    return (
      Reflect.has(e, 'wheelDelta')
        ? Reflect.get(e, 'wheelDelta')
        : -e.deltaY
    )
  }

  function normalize (n = 0) {
    return Math.max(Math.min(1, n), -1)
  }

  function handleMouseDown ({ offsetX, offsetY }) {
    X = offsetX
    Y = offsetY

    Array.from(document.getElementsByClassName('event-target'))
      .forEach((element) => {
        element.addEventListener('mousemove', handleMouseMove, { capture: true, bubbles: false, passive: true })

        element.addEventListener('wheel', handleWheel, { capture: true, bubbles: false })
      })
  }

  function handleMouseUp () {
    X = 0
    Y = 0

    Array.from(document.getElementsByClassName('event-target'))
      .forEach((element) => {
        element.removeEventListener('mousemove', handleMouseMove, { capture: true, bubbles: false, passive: true })

        element.removeEventListener('wheel', handleWheel, { capture: true, bubbles: false })
      })
  }

  function handleMouseMove ({ offsetX, offsetY }) {
    const message = {
      X: X - offsetX,
      Y: Y - offsetY,
      Z: 0
    }

    socket.emit('orbitSpeed', message)

    if (parent !== window) parent.postMessage({ type: 'orbitSpeed', message }, REMOTE_HOST)
  }

  function handleWheel (e) {
    e.preventDefault()

    const delta = normalize(getDelta(e))
    const Z = -delta * SCROLL_MULTIPLIER * -0.01

    const message = {
      X: 0,
      Y: 0,
      Z: Z * 0.05
    }

    socket.emit('orbitSpeed', message)

    if (parent !== window) parent.postMessage({ type: 'orbitSpeed', message }, REMOTE_HOST)
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
