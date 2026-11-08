/* 모먼티 오프라인 캐시 — 처음 한 번 인터넷으로 열면 모든 화면·사진·영상·음악을 저장해서 이후에는 인터넷 없이 실행됩니다.
   iOS Safari는 영상·음악을 Range 요청으로 받기 때문에 저장된 파일에서 요청 구간만 잘라 206 응답으로 돌려줍니다. */
const CACHE = 'momentea-548e26a33e';
const ASSETS = ['./', "./assets/audio/README.txt", "./assets/audio/bach-prelude-c.mp3", "./assets/fonts.css", "./assets/icon-180.png", "./assets/icon-192.png", "./assets/icon-512.png", "./assets/icons.css", "./assets/img/av_forest.jpg", "./assets/img/av_kim.jpg", "./assets/img/av_shadow.jpg", "./assets/img/avatar.jpg", "./assets/img/boseong.jpg", "./assets/img/chamomile.jpg", "./assets/img/d_chamomile.jpg", "./assets/img/d_dwaeji.jpg", "./assets/img/d_earlgrey.jpg", "./assets/img/d_martinez.jpg", "./assets/img/d_matcha.jpg", "./assets/img/d_morninghip.jpg", "./assets/img/d_pansy.jpg", "./assets/img/d_peach.jpg", "./assets/img/d_ppong.jpg", "./assets/img/d_sakuranbo.jpg", "./assets/img/d_samda.jpg", "./assets/img/d_sanghwang.jpg", "./assets/img/d_yangchul.jpg", "./assets/img/d_yeongeun.jpg", "./assets/img/d_yeonip.jpg", "./assets/img/daehan.jpg", "./assets/img/dilmah.jpg", "./assets/img/dilmah_eg.jpg", "./assets/img/dwaeji.jpg", "./assets/img/earlgrey.jpg", "./assets/img/fig.jpg", "./assets/img/happyterrace.jpg", "./assets/img/lychee.jpg", "./assets/img/martinez.jpg", "./assets/img/matcha.jpg", "./assets/img/pansy.jpg", "./assets/img/peach.jpg", "./assets/img/pet1.jpg", "./assets/img/pet2.jpg", "./assets/img/pet3.jpg", "./assets/img/pet4.jpg", "./assets/img/pet5.jpg", "./assets/img/pet6.jpg", "./assets/img/pet7.jpg", "./assets/img/pet8.jpg", "./assets/img/ppong.jpg", "./assets/img/r_chamomile.jpg", "./assets/img/r_dwaeji.jpg", "./assets/img/r_earlgrey.jpg", "./assets/img/r_martinez.jpg", "./assets/img/r_matcha.jpg", "./assets/img/r_morninghip.jpg", "./assets/img/r_pansy.jpg", "./assets/img/r_peach.jpg", "./assets/img/r_ppong.jpg", "./assets/img/r_sakuranbo.jpg", "./assets/img/r_samda.jpg", "./assets/img/r_sanghwang.jpg", "./assets/img/r_yangchul.jpg", "./assets/img/r_yeongeun.jpg", "./assets/img/r_yeonip.jpg", "./assets/img/royal.jpg", "./assets/img/sakuranbo.jpg", "./assets/img/samda.jpg", "./assets/img/sanghwang.jpg", "./assets/img/steep_chamomile.jpg", "./assets/img/steep_earlgrey.jpg", "./assets/img/steep_hibiscus.jpg", "./assets/img/tetley.jpg", "./assets/img/timer_bg.jpg", "./assets/img/v_black.jpg", "./assets/img/v_chamomile.jpg", "./assets/img/v_green.jpg", "./assets/img/v_hibiscus.jpg", "./assets/img/v_pansy.jpg", "./assets/img/yangchul.jpg", "./assets/img/yeongeun.jpg", "./assets/img/yeonip.jpg", "./assets/video/black.mp4", "./assets/video/chamomile.mp4", "./assets/video/green.mp4", "./assets/video/hibiscus.mp4", "./assets/video/pansy.mp4", "./index.html", "./js/app.js", "./js/data.js", "./js/detail-data.js", "./js/hangul.min.js", "./js/qrcode.js", "./manifest.webmanifest", "./qr.html", "./style.css"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
async function partial(res, range) {
  const buf = await res.arrayBuffer(), size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  let start = m[1] ? +m[1] : 0, end = m[2] ? +m[2] : size - 1;
  if (!m[1] && m[2]) { start = Math.max(0, size - +m[2]); end = size - 1; }
  end = Math.min(end, size - 1);
  if (start > end || start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': 'bytes */' + size } });
  const body = buf.slice(start, end + 1);
  return new Response(body, { status: 206, statusText: 'Partial Content', headers: {
    'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
    'Content-Range': 'bytes ' + start + '-' + end + '/' + size, 'Content-Length': String(body.byteLength), 'Accept-Ranges': 'bytes' } });
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true, ignoreVary: true }) ||
      (req.mode === 'navigate' ? await caches.match('./', { ignoreSearch: true }) : null);
    const range = req.headers.get('range');
    if (hit) return range ? partial(hit, range) : hit;
    try {
      const res = await fetch(req);
      if (res.ok && res.status === 200 && !range) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
      return res;
    } catch (err) { return new Response('', { status: 504 }); }
  })());
});
