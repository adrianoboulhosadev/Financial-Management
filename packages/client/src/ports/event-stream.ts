/**
 * The live inbox channel. The browser has `EventSource` built in; React Native
 * has nothing of the sort and needs `react-native-sse`. Both speak the same
 * protocol to the same backend route, so only the constructor differs.
 *
 * `open` returns its own teardown — that is what closes the connection when the
 * screen unmounts or the token rotates, and forgetting it is exactly how an SSE
 * client leaks a connection per navigation.
 */
export interface EventStreamFactory {
  open(url: string, onMessage: () => void): () => void
}
