import { Redirect } from 'expo-router'

// The entry has no screen of its own: it sends to the dashboard, and the
// private layout decides whether to allow it or bounce to the login.
export default function Index() {
  return <Redirect href="/dashboard" />
}
