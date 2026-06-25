/* Rescue Match — 3D effects overlay (three.js r128, global THREE).
   The video is full-bleed underneath; this transparent canvas adds streaming
   space-dust, embers, a warm portal-glow accent, and a dolly camera so the
   input cards float in real depth. Exposes window.RM3. */
(function () {
  'use strict';

  var cfg = Object.assign({ dust: 1, glow: 1, darken: 0.22 }, window.RM3_DEFAULTS || {});

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(a, b, x) { if (x <= a) return 0; if (x >= b) return 1; var t = (x - a) / (b - a); return t * t * (3 - 2 * t); }

  function discTexture(inner, outer) {
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var g = c.getContext('2d'); var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, inner); grd.addColorStop(0.5, outer); grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    var t = new THREE.Texture(c); t.needsUpdate = true; return t;
  }

  var R = {}, W, H, raf, clock;
  var camKeyZ = [18, 12, 6, 0, -8];
  var targetPhase = 0, phase = 0, prevPhase = 0, scrollVel = 0;
  var mouseX = 0, mouseY = 0;

  // particle field state
  var P = {}, EMB = {};

  function init() {
    var canvas = document.getElementById('webgl');
    W = window.innerWidth; H = window.innerHeight; clock = new THREE.Clock();

    R.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    R.renderer.setClearColor(0x000000, 0);
    R.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    R.renderer.setSize(W, H);

    R.scene = new THREE.Scene();
    R.camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 220);
    R.camera.position.set(0, 0, camKeyZ[0]);

    // ── streaming dust (the "travel through space" feel over the footage) ──
    var disc = discTexture('#ffffff', 'rgba(220,200,255,0.5)');
    var N = Math.round(2600 * cfg.dust);
    P.n = N; P.pos = new Float32Array(N * 3); P.vel = new Float32Array(N);
    P.zNear = 22; P.zFar = -78; P.span = P.zNear - P.zFar;
    for (var i = 0; i < N; i++) {
      P.pos[i*3]   = (Math.random() - 0.5) * 46;
      P.pos[i*3+1] = (Math.random() - 0.5) * 28;
      P.pos[i*3+2] = P.zFar + Math.random() * P.span;
      P.vel[i]     = 2.4 + Math.random() * 3.2;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(P.pos, 3));
    P.points = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.34, map: disc, color: 0xfff0d8, transparent: true, opacity: 0.78,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    }));
    R.scene.add(P.points);

    // ── glowing embers (sparser, warmer) ──
    var M = Math.round(70 * cfg.dust);
    EMB.n = M; EMB.pos = new Float32Array(M * 3); EMB.vel = new Float32Array(M);
    for (var k = 0; k < M; k++) {
      EMB.pos[k*3]   = (Math.random() - 0.5) * 40;
      EMB.pos[k*3+1] = (Math.random() - 0.5) * 24;
      EMB.pos[k*3+2] = P.zFar + Math.random() * P.span;
      EMB.vel[k]     = 1.6 + Math.random() * 2.4;
    }
    var egeo = new THREE.BufferGeometry();
    egeo.setAttribute('position', new THREE.BufferAttribute(EMB.pos, 3));
    EMB.points = new THREE.Points(egeo, new THREE.PointsMaterial({
      size: 1.15, map: discTexture('rgba(255,210,150,0.95)', 'rgba(217,119,6,0.25)'),
      color: 0xffc77a, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    R.scene.add(EMB.points);

    // ── warm portal-glow accent (blooms as the footage's portal opens) ──
    R.glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: discTexture('rgba(255,205,135,0.85)', 'rgba(217,119,6,0.18)'),
      transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    R.glow.scale.set(10, 10, 1);
    R.scene.add(R.glow);

    // light rays sprite (subtle vertical streak), reuse disc stretched
    R.rays = new THREE.Sprite(new THREE.SpriteMaterial({
      map: discTexture('rgba(255,235,200,0.6)', 'rgba(255,200,130,0.08)'),
      transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    R.rays.scale.set(3.2, 26, 1);
    R.scene.add(R.rays);

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', function (ev) {
      mouseX = ev.clientX / window.innerWidth - 0.5; mouseY = ev.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    R.ready = true; loop();
    if (window.RM3onReady) window.RM3onReady();
  }

  function onResize() {
    W = window.innerWidth; H = window.innerHeight;
    R.camera.aspect = W / H; R.camera.updateProjectionMatrix(); R.renderer.setSize(W, H);
  }

  function streamPoints(store, posAttr, camZ, dt, speed) {
    var pos = store.pos, n = store.n, recycleAhead = camZ + 7;
    for (var i = 0; i < n; i++) {
      var zi = i * 3 + 2;
      pos[zi] += store.vel[i] * dt * speed;
      if (pos[zi] > recycleAhead) {
        pos[zi] -= P.span;                       // wrap to the far end
        pos[i*3]   = (Math.random() - 0.5) * 46;
        pos[i*3+1] = (Math.random() - 0.5) * 28;
      }
    }
    posAttr.needsUpdate = true;
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    if (!R.ready) return;
    var dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime;

    prevPhase = phase;
    phase += (targetPhase - phase) * Math.min(1, dt * 3.2);
    scrollVel = scrollVel * 0.9 + Math.abs(phase - prevPhase) / Math.max(dt, 0.001) * 0.1;
    var pf = phase;

    // camera dolly + parallax (gives the cards real depth over the video)
    var iz = clamp(Math.floor(pf), 0, 4), fz = clamp(pf - iz, 0, 1);
    var z = lerp(camKeyZ[iz], camKeyZ[Math.min(iz + 1, 4)], fz);
    var ox = mouseX * 1.6, oy = -mouseY * 1.1;
    R.camera.position.set(ox, oy, z);
    R.camera.lookAt(ox * 0.3, oy * 0.3, z - 10);

    // Story-driven particle envelope: calm, faint drift before the portal opens;
    // intensifies (denser, brighter, faster) through the portal-opening climax;
    // then calms again toward the end.
    var env = smooth(1.5, 3.0, pf) * (1 - smooth(3.35, 4.0, pf));
    var speed = (0.5 + env * 3.4) + Math.min(scrollVel, 6) * 0.2;
    streamPoints(P, P.points.geometry.attributes.position, z, dt, speed);
    streamPoints(EMB, EMB.points.geometry.attributes.position, z, dt, speed * 0.8);
    P.points.material.opacity = (0.20 + env * 0.66) * cfg.dust;
    P.points.material.size = 0.30 + env * 0.16;
    EMB.points.material.opacity = (0.14 + env * 0.6) * cfg.dust * (0.78 + 0.22 * Math.sin(t * 1.4));
    EMB.points.material.size = 1.0 + env * 0.5;

    // glow accent follows the camera, blooms through the portal-opening beat
    R.glow.position.set(ox * 0.4, oy * 0.4, z - 13);
    R.rays.position.copy(R.glow.position);
    var gb = smooth(1.9, 3.1, pf) * (1 - smooth(3.7, 4.0, pf));
    R.glow.material.opacity = gb * 0.9 * cfg.glow;
    R.rays.material.opacity = gb * 0.35 * cfg.glow;
    var gs = 10 + gb * 26;
    R.glow.scale.set(gs * (1 + Math.sin(t * 1.6) * 0.05), gs * (1 + Math.sin(t * 1.6) * 0.05), 1);

    if (window.RM3updateCards) window.RM3updateCards(R.camera, pf, W, H);
    R.renderer.render(R.scene, R.camera);
  }

  window.RM3 = {
    setProgress: function (p) { targetPhase = clamp(p, 0, 1) * 4; },
    phase: function () { return phase; },
    project: function (vec3) {
      var v = vec3.clone().project(R.camera);
      return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, behind: v.z > 1, dist: R.camera.position.distanceTo(vec3) };
    },
    THREEReady: function () { return !!R.ready; },
    pixelProbe: function () {
      try { var gl = R.renderer.getContext(); var px = new Uint8Array(4); gl.readPixels((W/2)|0, (H/2)|0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return [px[0],px[1],px[2],px[3]]; }
      catch (e) { return 'err:' + e.message; }
    },
    apply: function (next) {
      next = next || {};
      if (next.glow != null) cfg.glow = next.glow;
      if (next.dust != null) cfg.dust = next.dust;
      if (next.darken != null) { var el = document.getElementById('vTint'); if (el) el.style.opacity = String(next.darken); }
      if (next.hue != null) { var c = document.querySelectorAll('.bgv'); c.forEach(function (v) { v.style.filter = 'hue-rotate(' + next.hue + 'deg) saturate(1.05)'; }); }
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
