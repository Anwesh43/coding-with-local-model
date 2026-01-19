import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            workbox: { // Configuration for workbox
                maximumFileSizeToCacheInBytes: 5 * 1024 ** 2, // Sets the limit to 5 MB
            },
            devOptions: {
                enabled: true // This allows testing on localhost
            }
        })
    ]
});