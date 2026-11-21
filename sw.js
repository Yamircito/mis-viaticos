const STATIC_CACHE='mis-viaticos-v03-static-3';
const RUNTIME_CACHE='mis-viaticos-v03-ocr';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith('mis-viaticos-')&&key!==STATIC_CACHE&&key!==RUNTIME_CACHE)await caches.delete(key)}await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin===self.location.origin){
    e.respondWith((async()=>{const cache=await caches.open(STATIC_CACHE);const hit=await cache.match(e.request);if(hit)return hit;try{let r=await fetch(e.request);if(r.ok)await cache.put(e.request,r.clone());return r}catch(ex){return (await cache.match('./index.html'))||Response.error()}})());
    return;
  }
  if(url.hostname==='cdn.jsdelivr.net'||url.hostname==='tessdata.projectnaptha.com'){
    e.respondWith((async()=>{let cache=await caches.open(RUNTIME_CACHE);let hit=await cache.match(e.request);if(hit)return hit;let response=await fetch(e.request);if(response.ok||response.type==='opaque')await cache.put(e.request,response.clone());return response})());
  }
});
