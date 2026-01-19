import { ServiceWorkerMLCEngineHandler } from "@mlc-ai/web-llm";
let handler = null
self.addEventListener('activate', () => {
    handler = new ServiceWorkerMLCEngineHandler()
    console.log("service worker activated")
})