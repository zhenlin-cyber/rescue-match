(function () {
  var COLORS = [
    new THREE.Color('#5227FF'),
    new THREE.Color('#D97706'),
    new THREE.Color('#FFE880'),
    new THREE.Color('#FF9FFC'),
    new THREE.Color('#40ffaa'),
    new THREE.Color('#4079ff'),
    new THREE.Color('#5227FF'),
  ];

  var SPEED = 1 / (4 * 60); // 4-second yoyo cycle at ~60fps
  var progress = 0, dir = 1;
  var mx = 0, my = 0, rotX = 0, rotY = 0;

  var vert = [
    'varying float vX;',
    'varying vec3 vNorm;',
    'void main() {',
    '  vX = position.x;',
    '  vNorm = normalMatrix * normal;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}',
  ].join('\n');

  var frag = [
    'precision mediump float;',
    'uniform float u_progress;',
    'uniform float u_minX;',
    'uniform float u_rangeX;',
    'uniform vec3 u_colors[7];',
    'varying float vX;',
    'varying vec3 vNorm;',

    'vec3 grad(float t) {',
    '  t = clamp(t, 0.0, 1.0) * 6.0;',
    '  if (t < 1.0) return mix(u_colors[0], u_colors[1], t);',
    '  if (t < 2.0) return mix(u_colors[1], u_colors[2], t - 1.0);',
    '  if (t < 3.0) return mix(u_colors[2], u_colors[3], t - 2.0);',
    '  if (t < 4.0) return mix(u_colors[3], u_colors[4], t - 3.0);',
    '  if (t < 5.0) return mix(u_colors[4], u_colors[5], t - 4.0);',
    '  return mix(u_colors[5], u_colors[6], t - 5.0);',
    '}',

    'void main() {',
    '  float x = (vX - u_minX) / u_rangeX;',
    // CSS-equivalent: background-size 300%, position animated 0%→100%
    '  float t = clamp((x + u_progress * 2.0) / 3.0, 0.0, 1.0);',
    '  vec3 color = grad(t);',

    // Lighting: front faces show full gradient, extruded sides are shaded
    '  vec3 n = normalize(vNorm);',
    '  float fwd  = max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0);', // how much facing camera
    '  float key  = max(dot(n, normalize(vec3(1.5, 2.0, 3.0))), 0.0);', // key light
    '  float rim  = max(dot(n, normalize(vec3(-2.0, 0.5, -1.0))), 0.0);', // warm rim

    '  float brightness = 0.35 + 0.5 * key + 0.55 * fwd * fwd;',
    '  vec3 rimColor = vec3(1.0, 0.52, 0.08) * rim * 0.4;',

    '  gl_FragColor = vec4(color * brightness + rimColor, 1.0);',
    '}',
  ].join('\n');

  var renderer, scene, camera, group, gradMat;
  var initialized = false;

  function hexToV3(c) { return new THREE.Vector3(c.r, c.g, c.b); }

  function init() {
    if (initialized) return;
    initialized = true;

    var mount = document.getElementById('rmHeroLogo');
    if (!mount) return;

    var W = mount.clientWidth || 800;
    var H = mount.clientHeight || 180;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
    mount.style.position = 'relative';
    mount.appendChild(canvas);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(26, W / H, 0.1, 100);
    camera.position.z = 9;

    group = new THREE.Group();
    scene.add(group);

    gradMat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        u_progress: { value: 0 },
        u_minX:     { value: 0 },
        u_rangeX:   { value: 1 },
        u_colors:   { value: COLORS.map(hexToV3) },
      },
    });

    var loader = new THREE.FontLoader();
    loader.load(
      'https://unpkg.com/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json',
      function (font) {
        var opts = {
          font: font,
          size: 0.88,
          height: 0.22,
          curveSegments: 10,
          bevelEnabled: true,
          bevelThickness: 0.06,
          bevelSize: 0.024,
          bevelSegments: 4,
        };

        var g1 = new THREE.TextGeometry('RESCUE', opts);
        g1.computeBoundingBox(); g1.center();

        var g2 = new THREE.TextGeometry('MATCH', opts);
        g2.computeBoundingBox(); g2.center();

        // Gradient spans the wider of the two lines
        var minX = Math.min(g1.boundingBox.min.x, g2.boundingBox.min.x);
        var maxX = Math.max(g1.boundingBox.max.x, g2.boundingBox.max.x);
        gradMat.uniforms.u_minX.value = minX;
        gradMat.uniforms.u_rangeX.value = maxX - minX;

        var m1 = new THREE.Mesh(g1, gradMat);
        m1.position.y = 0.62;
        group.add(m1);

        var m2 = new THREE.Mesh(g2, gradMat);
        m2.position.y = -0.62;
        group.add(m2);

        window.addEventListener('resize', function () {
          W = mount.clientWidth;
          H = mount.clientHeight;
          renderer.setSize(W, H, false);
          camera.aspect = W / H;
          camera.updateProjectionMatrix();
        });

        animate();
      }
    );
  }

  function animate() {
    requestAnimationFrame(animate);

    // Yoyo gradient
    progress += SPEED * dir;
    if (progress >= 1) { progress = 1; dir = -1; }
    if (progress <= 0) { progress = 0; dir = 1; }
    gradMat.uniforms.u_progress.value = progress;

    // Spring-follow mouse
    rotY += (mx * 0.28 - rotY) * 0.055;
    rotX += (-my * 0.18 - rotX) * 0.055;
    group.rotation.y = rotY;
    group.rotation.x = rotX;

    renderer.render(scene, camera);
  }

  document.addEventListener('mousemove', function (e) {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Initialize when the end gate screen appears
  var endGate = document.getElementById('endGate');
  if (endGate) {
    new MutationObserver(function () {
      if (endGate.classList.contains('show')) init();
    }).observe(endGate, { attributes: true, attributeFilter: ['class'] });
  }
})();
