/* Rescue Match — ambient audio. Muted by default; user toggles. */
(function () {
  'use strict';
  var ctx = null, master = null, droneGain = null, started = false, muted = true;
  var hoverTarget = 0;

  function ensure() {
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);

    // ambient drone: two detuned oscillators through a lowpass
    droneGain = ctx.createGain(); droneGain.gain.value = 0.0;
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
    droneGain.connect(lp); lp.connect(master);
    [110, 110.4, 165].forEach(function (f, i) {
      var o = ctx.createOscillator();
      o.type = i === 2 ? 'sine' : 'sawtooth';
      o.frequency.value = f;
      var g = ctx.createGain(); g.gain.value = i === 2 ? 0.18 : 0.12;
      o.connect(g); g.connect(droneGain); o.start();
    });
  }

  function chime() {
    if (!ctx || muted) return;
    var now = ctx.currentTime;
    [784, 1175, 1568].forEach(function (f, i) {
      var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.22, now + i * 0.06 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 1.1);
      o.connect(g); g.connect(master);
      o.start(now + i * 0.06); o.stop(now + i * 0.06 + 1.2);
    });
  }

  function tick() {
    if (droneGain) {
      var cur = droneGain.gain.value;
      droneGain.gain.value = cur + (hoverTarget * 0.7 + 0.12 - cur) * 0.06;
    }
    requestAnimationFrame(tick);
  }
  tick();

  function setMuted(m) {
    muted = m;
    if (master) master.gain.setTargetAtTime(muted ? 0 : 0.5, ctx.currentTime, 0.1);
    var btn = document.getElementById('soundBtn');
    if (btn) {
      var label = btn.querySelector('.sound-label');
      var icon = btn.querySelector('.sound-icon');
      if (label) label.textContent = muted ? 'sound off' : 'sound on';
      if (icon) { icon.textContent = muted ? '🔇' : '🔊'; icon.classList.toggle('playing', !muted); }
      if (!label && !icon) btn.textContent = muted ? '🔇' : '🔊';
    }
  }

  window.RMAudio = {
    start: function () { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); started = true; },
    setHover: function (v) { hoverTarget = v; },
    chime: chime,
    toggleMute: function () { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); setMuted(!muted); return muted; },
    isMuted: function () { return muted; }
  };
})();
