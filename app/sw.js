// Only push handling. Deliberately no caching of private API responses or health records.
self.addEventListener('push', event => {
  let p = {}
  try { p = event.data?.json() ?? {} } catch {}
  const url = typeof p.url === 'string' && p.url.startsWith('#/member/') ? p.url : '#/member/notifications'
  event.waitUntil(self.registration.showNotification('Performance Day', {
    body: typeof p.body === 'string' ? p.body.slice(0, 180) : 'You have a new update. Open the app to see it.',
    icon: new URL('icon.png', self.registration.scope).href,
    badge: new URL('icon.png', self.registration.scope).href,
    tag: typeof p.id === 'string' ? p.id : 'performance-day',
    data: { url },
  }))
})
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const hash = event.notification.data?.url
  const target = new URL(typeof hash === 'string' && hash.startsWith('#/member/') ? hash : '#/member/notifications', self.registration.scope).href
  event.waitUntil((async () => {
    const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const tab of tabs) if (tab.url.startsWith(self.registration.scope) && 'focus' in tab) {
      await tab.navigate(target); await tab.focus(); return
    }
    await self.clients.openWindow(target)
  })())
})
