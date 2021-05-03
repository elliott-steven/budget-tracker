const CACHE_NAME = 'static-cache';
const DATA_CACHE_NAME = 'data-cache';

const staticFilesToPreCache = [
    "/",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png",
    "index.html",
    "index.js",
    "styles.css",
    "/manifest.webmanifest",
    "db.js",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

// Installing
self.addEventListener("install", function (evt) {

    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {

            console.log("Pre-cache successful!");
            return cache.addAll(staticFilesToPreCache);
        })
    );

    self.skipWaiting();
});

// Activating 
self.addEventListener("activate", function (evt) {

    evt.waitUntil(
        caches.keys().then(keyList => {

            return Promise.all(
                keyList.map(key => {

                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {

                        console.log("Removing old data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// Fetching

self.addEventListener('fetch', function (evt) {

    if (evt.request.url.includes('/api/')) {

        console.log('[Service Worker] Fetch (data)', evt.request.url);

        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {

                return fetch(evt.request)
                    .then(response => {

                        if (response.status === 200) {

                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {

                        // If there is no network, try to get it from the cache.
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );
    } else {

        evt.respondWith(
            caches.open(CACHE_NAME).then(cache => {

                return cache.match(evt.request).then(response => {

                    return response || fetch(evt.request);
                });
            })
        );
    }
});