import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            workbox: { // Configuration for workbox
                maximumFileSizeToCacheInBytes: 10 * 1024 ** 2, // Sets the limit to 5 MB
            },
            devOptions: {
                enabled: true // This allows testing on localhost
            }
        }),
        viteStaticCopy({
            targets: [
                {
                    src: './serviceWorker.js', // correct path to this file.
                    dest: './', // root of your output directory
                },
            ],
        }),
    ]
});