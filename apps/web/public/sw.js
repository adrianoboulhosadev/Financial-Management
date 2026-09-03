// Minimal hand-rolled service worker — no Workbox, no next-pwa. Same "no new
// lib when it's this small" call the rest of the front already makes.
//
// Scope on purpose: ONLY page navigations go through here. API calls, RSC
// payloads and everything under /uploads are left untouched, so nothing
// auth-gated or money-related (saldo do mês, lançamentos, comprovantes) ever
// sits in a client-side cache — a shared device would otherwise serve one
// person's numbers to the next.
//
// All this buys is "the app still opens to something readable when the network
// is down", which is also the fetch handler Chrome's installability check
// wants.
const CACHE_NAME = 'financial-shell-v1'
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return

  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)))
})
