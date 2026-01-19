import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy'
export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            workbox: { // Configuration for workbox
                maximumFileSizeToCacheInBytes: 10 * 1024 ** 2, // Sets the limit to 5 MB
            },
            devOptions: {
                enabled: true // This allows testing on localhost
            },
            srcDir: 'src',
            filename: 'serviceWorker.js',
            strategies: 'injectManifest',
            injectRegister: false,
            manifest: false,
            injectManifest: {
                injectionPoint: undefined,
            },
        }),
    ]
});