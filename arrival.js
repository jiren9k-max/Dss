// ---------- Intro: a car drives in, water splashes off it and washes the screen away ----------
// Plays on every page load (see the inline script in <head>), skipped for reduced motion.
(() => {
  const root = document.documentElement;
  const intro = document.getElementById('arrival');
  if (!intro) return;
  if (!root.classList.contains('arrival-on')) { intro.remove(); return; }

  const cover = intro.querySelector('.arrival-cover');
  const fx = intro.querySelector('.arrival-fx');
  const car = intro.querySelector('.arrival-car');
  const body = car.querySelector('.ic-body');
  const wheels = [...car.querySelectorAll('.arrival-wheel')];
  const brand = intro.querySelector('.arrival-brand');
  const cctx = cover.getContext('2d');
  const fctx = fx.getContext('2d');

  // Timeline (ms)
  const DRIVE = 1300;   // car drives in and brakes
  const SPRAY = 1050;   // water starts spraying off the car
  const SPLASH = 2050;  // big splash washes the screen away
  const END = 3000;     // fade out what is left

  let W = 0, H = 0, S = 1, D = 1, carW = 0, carH = 0, carTop = 0, startX = 0, endX = 0, carX = 0;
  const drops = [];
  const blobs = [];
  let t = 0, last = 0, splashed = false, finished = false, removed = false;

  const unit = (v) => (v * carW) / 400; // car SVG units -> px (viewBox is 400 wide)
  const rand = (a, b) => a + Math.random() * (b - a);

  function layout() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    S = Math.min(W, 1400) / 1000;
    D = Math.hypot(W, H) / 1000;
    [cover, fx].forEach((c) => {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    carW = Math.min(W * 0.82, 560);
    carH = (carW * 150) / 400;
    carTop = H * 0.62 - carH * 0.72;
    startX = -carW - 80;
    endX = (W - carW) / 2;
    car.style.width = `${carW}px`;
    brand.style.top = `${carTop}px`;
    paintCover();
  }

  function paintCover() {
    cctx.globalCompositeOperation = 'source-over';
    cctx.fillStyle = '#0a0b0a';
    cctx.fillRect(0, 0, W, H);
    const gy = carTop + unit(132);
    // soft green glow on the floor
    cctx.save();
    cctx.translate(W / 2, gy);
    cctx.scale(1, 0.2);
    const glow = cctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.55);
    glow.addColorStop(0, 'rgba(56,181,74,.28)');
    glow.addColorStop(1, 'rgba(56,181,74,0)');
    cctx.fillStyle = glow;
    cctx.fillRect(-W, -W, W * 2, W * 2);
    cctx.restore();
    // floor line
    const line = cctx.createLinearGradient(0, 0, W, 0);
    line.addColorStop(0, 'rgba(127,224,140,0)');
    line.addColorStop(0.5, 'rgba(127,224,140,.55)');
    line.addColorStop(1, 'rgba(127,224,140,0)');
    cctx.fillStyle = line;
    cctx.fillRect(0, gy, W, 1);
  }

  function spawnSpray() {
    const u = Math.random();
    drops.push({
      x: carX + unit(50 + u * 310),
      y: carTop + unit(rand(26, 62)),
      vx: (u - 0.5) * rand(0.5, 1.1) * S,
      vy: -rand(0.35, 0.95) * S,
      r: rand(1, 2.6) * Math.max(S, 0.6),
      life: 0,
      max: rand(600, 1100),
      green: Math.random() < 0.18,
    });
  }

  function splash() {
    splashed = true;
    root.classList.remove('arrival-hold'); // hero animations start underneath
    car.classList.add('out');
    brand.classList.add('out');
    const cx = carX + carW / 2;
    const cy = carTop + carH * 0.55;
    blobs.push({ x: cx, y: cy, vx: 0, vy: 0, r: carW * 0.25, gr: 0.5 * D });
    const n = 30;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand(-0.12, 0.12);
      const sp = rand(0.6, 1.5) * D;
      blobs.push({ x: cx + rand(-carW * 0.3, carW * 0.3), y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rand(16, 40) * Math.max(S, 0.6), gr: rand(0.1, 0.3) * D });
    }
    for (let i = 0; i < 280; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = rand(0.25, 1.7) * D;
      drops.push({ x: cx + rand(-carW * 0.4, carW * 0.4), y: cy + rand(-carH * 0.3, carH * 0.2), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.2 * D, r: rand(1.2, 3.4) * Math.max(S, 0.6), life: 0, max: rand(500, 1000), green: Math.random() < 0.15 });
    }
  }

  function erase(dt, fade) {
    const decay = Math.pow(0.9965, dt);
    cctx.globalCompositeOperation = 'destination-out';
    fctx.globalCompositeOperation = 'source-over';
    blobs.forEach((b) => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vx *= decay;
      b.vy *= decay;
      b.r += b.gr * dt;
      const g = cctx.createRadialGradient(b.x, b.y, b.r * 0.5, b.x, b.y, b.r);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      cctx.fillStyle = g;
      cctx.beginPath();
      cctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      cctx.fill();
      // wet, glossy edge of the water front (fades as the wave spreads)
      if (fade <= 0) return;
      const rim = fctx.createRadialGradient(b.x, b.y, b.r * 0.72, b.x, b.y, b.r);
      rim.addColorStop(0, 'rgba(230,248,255,0)');
      rim.addColorStop(0.85, `rgba(230,248,255,${(0.09 * fade).toFixed(3)})`);
      rim.addColorStop(1, 'rgba(230,248,255,0)');
      fctx.fillStyle = rim;
      fctx.beginPath();
      fctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      fctx.fill();
    });
  }

  function drawDrops(dt) {
    const g = 0.0012 * S;
    fctx.lineCap = 'round';
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.life += dt;
      d.vy += g * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.life > d.max || d.y > H + 40 || d.x < -40 || d.x > W + 40) { drops.splice(i, 1); continue; }
      const a = 1 - d.life / d.max;
      fctx.strokeStyle = d.green ? `rgba(127,224,140,${a * 0.8})` : `rgba(228,244,255,${a * 0.9})`;
      fctx.lineWidth = d.r;
      fctx.beginPath();
      fctx.moveTo(d.x, d.y);
      fctx.lineTo(d.x - d.vx * 16, d.y - d.vy * 16);
      fctx.stroke();
    }
  }

  function frame(now) {
    if (removed) return;
    // Advance by frame time (capped) so a stalled frame or background tab never skips the show
    const dt = last ? Math.max(0, Math.min(now - last, 40)) : 0;
    last = now;
    t += dt;

    // Drive in with an ease-out, wheels roll with the distance travelled
    const p = Math.min(t / DRIVE, 1);
    const e = 1 - Math.pow(1 - p, 3);
    carX = startX + (endX - startX) * e;
    const ang = (((carX - startX) / unit(26)) * 180) / Math.PI;
    wheels.forEach((w) => w.setAttribute('transform', `rotate(${ang.toFixed(1)} ${w.dataset.cx} ${w.dataset.cy})`));
    // Nose dips when braking, then settles
    const k = t - DRIVE * 0.82;
    const dip = k > 0 ? Math.sin(k / 75) * Math.exp(-k / 170) * 2.4 : 0;
    body.setAttribute('transform', `rotate(${dip.toFixed(2)} 98 104)`);
    car.style.transform = `translate(${carX}px, ${carTop}px)`;
    if (t > DRIVE - 300) car.classList.add('lights');
    if (t > 300) brand.classList.add('show');

    fctx.clearRect(0, 0, W, H);
    if (t > SPRAY && t < SPLASH + 200) for (let i = 0; i < 6; i++) spawnSpray();
    if (!splashed && t >= SPLASH) splash();
    if (blobs.length) erase(dt, Math.max(0, 1 - (t - SPLASH) / 600));
    drawDrops(dt);

    if (t >= END) finish();
    requestAnimationFrame(frame);
  }

  function finish() {
    if (finished) return;
    finished = true;
    root.classList.remove('arrival-hold');
    intro.classList.add('done');
    setTimeout(() => {
      removed = true;
      intro.remove();
      root.classList.remove('arrival-on');
    }, 500);
  }

  intro.addEventListener('click', finish);
  document.addEventListener('keydown', (ev) => { if (!finished && ['Escape', 'Enter', ' '].includes(ev.key)) finish(); });
  window.addEventListener('resize', () => { if (finished) return; if (splashed) finish(); else layout(); });

  layout();
  intro.classList.add('ready');
  requestAnimationFrame(frame);
})();
