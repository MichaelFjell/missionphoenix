// Klick på kvällspåminnelsen: fokusera appen om den är öppen, annars öppna den.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const scope = self.registration.scope
      const client = list.find((c) => c.url.startsWith(scope)) || list[0]
      return client ? client.focus() : self.clients.openWindow(scope)
    })
  )
})
