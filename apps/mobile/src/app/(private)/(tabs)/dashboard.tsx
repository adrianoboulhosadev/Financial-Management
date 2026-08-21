// Expo Router turns every file under `app/` into a route, so a screen's hooks
// and sub-components cannot live beside it — they would become broken routes.
// The screen therefore lives in `src/screens/` with its own hooks folder, and
// this file is the route entry that points at it.
export { DashboardScreen as default } from '@/screens/dashboard'
