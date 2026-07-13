// Kvällspåminnelsen i service workern: tar emot serverns push även när
// appen är stängd, och hanterar klick på notisen. Om dagens löfte redan
// är besvarat (läses lokalt ur IndexedDB – servern vet inget om svaren)
// visas ingen notis.

self.addEventListener('push', (event) => {
  event.waitUntil(showEveningReminder(event))
})

async function showEveningReminder(event) {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    // ingen läsbar nyttolast – falla tillbaka på standardtexten
  }
  try {
    if (await answeredToday()) return
  } catch {
    // kan inte läsa lokal data – visa hellre notisen än att tappa den
  }
  const icon = new URL('icon-192.png', self.registration.scope).href
  await self.registration.showNotification(payload.title || 'Ärlighetsinventeringen', {
    body: payload.body || 'Höll du dagens löfte? Öppna appen och svara.',
    tag: 'evening-checkin',
    icon,
    badge: icon,
  })
}

function todayKey() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

async function answeredToday() {
  // Öppna inte databasen om den inte finns (undviker att skapa ett tomt
  // skal innan appen själv har hunnit initiera den).
  if (indexedDB.databases) {
    const dbs = await indexedDB.databases()
    if (!dbs.some((d) => d.name === 'inventering')) return false
  }
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('inventering')
    req.onerror = () => reject(req.error)
    req.onsuccess = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('inventering_state')) {
        db.close()
        resolve(false)
        return
      }
      const get = db
        .transaction('inventering_state', 'readonly')
        .objectStore('inventering_state')
        .get('state')
      get.onsuccess = () => {
        const state = get.result
        const day = state?.promiseDays?.find?.((p) => p.date === todayKey())
        db.close()
        resolve(Boolean(day?.result))
      }
      get.onerror = () => {
        db.close()
        reject(get.error)
      }
    }
  })
}

// Klick på notisen: fokusera appen om den är öppen, annars öppna den.
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
