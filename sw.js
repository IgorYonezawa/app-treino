/* Service worker: guarda tudo para funcionar sem internet. Mude VERSAO ao atualizar o app. */
const VERSAO='ficha-polia-v8';
const ARQUIVOS=[
  './','index.html','manifest.webmanifest',
  'icons/apple-touch-icon.png','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png',
  'fonts/big-shoulders-display.woff2','fonts/inter.woff2','fonts/jetbrains-mono.woff2'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSAO).then(c=>c.addAll(ARQUIVOS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return; /* YouTube etc. vão direto para a rede */
  e.respondWith(
    caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{
      if(res&&res.ok){const cp=res.clone();caches.open(VERSAO).then(c=>c.put(r,cp))}
      return res;
    }).catch(()=>r.mode==='navigate'?caches.match('index.html'):undefined))
  );
});
