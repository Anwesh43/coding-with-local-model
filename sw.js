self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('v1').then((cache) => {
            cache.addAll([
                "/",
                "/assets/index-CW_JBB1t.js",
                "/assets/index-DuqByxos.css",
                "/registerSW.js",
                "/vite.svg"
            ])
        })
    )
})