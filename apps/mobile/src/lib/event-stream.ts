import EventSource from 'react-native-sse'

/**
 * The phone's adapter of the `EventStreamFactory` port. React Native has no
 * built-in `EventSource`, so this is the one piece of the live inbox that could
 * not be shared — the protocol, the route and the token in the query string are
 * identical to the web's.
 *
 * Returns its own teardown, which is what closes the connection when the screen
 * unmounts or the token rotates.
 */
export function openEventStream(url: string, onMessage: () => void): () => void {
  const source = new EventSource(url)
  source.addEventListener('message', () => onMessage())

  return () => {
    source.removeAllEventListeners()
    source.close()
  }
}
