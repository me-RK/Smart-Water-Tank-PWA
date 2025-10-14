const CACHE_NAME = 'smart-water-tank-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network first for API, cache first for static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip WebSocket requests
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Network first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clonedResponse));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request)
      .then(response => response || fetch(request))
      .catch(() => new Response('Offline - resource not found', { status: 404 }))
  );
});

// Handle background sync for queued commands
self.addEventListener('sync', event => {
  if (event.tag === 'sync-motor-commands') {
    event.waitUntil(syncMotorCommands());
  }
});

async function syncMotorCommands() {
  try {
    const db = await openIndexedDB();
    const commands = await getQueuedCommands(db);
    
    for (const cmd of commands) {
      try {
        await sendCommand(cmd);
        await deleteQueuedCommand(db, cmd.id);
      } catch (err) {
        console.error('Command sync failed:', err);
      }
    }
  } catch (err) {
    console.error('Background sync error:', err);
  }
}

// IndexedDB helpers for offline command queuing
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SmartTankDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('commands')) {
        db.createObjectStore('commands', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getQueuedCommands(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['commands'], 'readonly');
    const store = transaction.objectStore('commands');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteQueuedCommand(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['commands'], 'readwrite');
    const store = transaction.objectStore('commands');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function sendCommand(command) {
  // This would be implemented to send commands when connection is restored
  // For now, just log the command
  console.log('Sending queued command:', command);
}
