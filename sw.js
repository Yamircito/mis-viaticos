const STATIC_CACHE='mis-viaticos-v043-static-1';
const OCR_CACHE='mis-viaticos-v03-ocr';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(STATIC_CACHE);await c.addAll(ASSETS)})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith('mis-viaticos-v')&&key.includes('static-')&&key!==STATIC_CACHE)await caches.delete(key)}await self.clients.claim()})())});
self.addEventListener('message',e=>{if(e.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const url=new URL(e.request.url);
 if(url.origin===self.location.origin){
  e.respondWith((async()=>{
   const cache=await caches.open(STATIC_CACHE);
   // Network-first navigation while online, cached offline. Static resources cache-first.
   if(e.request.mode==='navigate'){
    try{const r=await fetch(e.request,{cache:'no-store'});if(r.ok)await cache.put('./index.html',r.clone());return r}
    catch(e){return await cache.match('./index.html')||Response.error()}
   }
   const hit=await cache.match(e.request);if(hit)return hit;
   try{const r=await fetch(e.request);if(r.ok)await cache.put(e.request,r.clone());return r}
   catch(e){return await cache.match('./index.html')||Response.error()}
  })());return;
 }
 if(url.hostname==='cdn.jsdelivr.net'||url.hostname==='tessdata.projectnaptha.com'){
  e.respondWith((async()=>{const c=await caches.open(OCR_CACHE),hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);if(r.ok||r.type==='opaque')await c.put(e.request,r.clone());return r})());
 }
});
