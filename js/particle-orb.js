/**
 * Osmo Particle Orb — Canvas2D
 * 150 particles in 3 concentric rings, orbit + breathing + subtle noise
 * Hover: gentle scatter. Click: smooth scatter then reform
 */

(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth < 768;
  const particleCount = reducedMotion ? 50 : isMobile() ? 100 : 150;

  const canvas = document.getElementById('particle-orb');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const size = 220;
  const centerX = size / 2;
  const centerY = size / 2;

  const rings = [
    { min: 33, max: 60 },
    { min: 60, max: 88 },
    { min: 88, max: 110 },
  ];

  let particles = [];
  let animationId = null;
  let startTime = 0;
  let hovered = false;
  let scatterPhase = 'idle'; // 'idle' | 'scatter' | 'reform'
  let scatterStart = 0;
  const scatterOutDuration = 400;
  const reformDuration = 600;

  function noise2(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }

  function smoothNoise(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    const a = noise2(ix, iy);
    const b = noise2(ix + 1, iy);
    const c = noise2(ix, iy + 1);
    const d = noise2(ix + 1, iy + 1);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function initParticles() {
    particles = [];
    let idx = 0;
    for (const ring of rings) {
      const count = Math.ceil(particleCount / 3);
      for (let i = 0; i < count && idx < particleCount; i++, idx++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
        const radius = ring.min + Math.random() * (ring.max - ring.min);
        particles.push({
          baseRadius: radius,
          baseAngle: angle,
          size: 0.8 + Math.random() * 1.4,
          brightness: 0.4 + Math.random() * 0.5,
          orbitSpeed: (0.25 + Math.random() * 0.35) * (Math.random() > 0.5 ? 1 : -1),
          breathPhase: Math.random() * Math.PI * 2,
          noisePhase: Math.random() * Math.PI * 2,
          currentRadius: radius,
          currentAngle: angle,
        });
      }
    }
  }

  function render(t) {
    if (!startTime) startTime = t;
    const elapsed = (t - startTime) / 1000;

    ctx.clearRect(0, 0, size, size);

    const warmupDuration = 1.2;
    const warmup = Math.min(1, elapsed / warmupDuration);
    const noiseStrength = 3 * easeOutCubic(warmup);
    const noiseSpeed = 0.8;
    const lerpSpeed = 0.08 + 0.04 * warmup;

    const idleBobY = reducedMotion ? 0 : Math.sin(elapsed * 0.5) * 2 + Math.sin(elapsed * 0.9) * 1;
    ctx.save();
    ctx.translate(centerX, centerY + idleBobY);

    particles.forEach((p) => {
      const orbitAngle = p.baseAngle + elapsed * p.orbitSpeed;
      const breath = 1 + Math.sin(elapsed * 0.4 + p.breathPhase) * 0.08;

      let targetRadius, targetAngle;

      if (scatterPhase === 'scatter') {
        const progress = Math.min(1, (t - scatterStart) / scatterOutDuration);
        const amount = easeOutCubic(progress) * 18;
        targetRadius = p.baseRadius * breath + amount;
        targetAngle = orbitAngle + amount * 0.05;
      } else if (scatterPhase === 'reform') {
        const progress = Math.min(1, (t - scatterStart) / reformDuration);
        const amount = 18 * (1 - easeInOutCubic(progress));
        targetRadius = p.baseRadius * breath + amount;
        targetAngle = orbitAngle + amount * 0.05;
      } else if (hovered) {
        targetRadius = p.baseRadius * breath + 5;
        targetAngle = orbitAngle;
      } else {
        const n = smoothNoise(elapsed * noiseSpeed * 0.15 + p.noisePhase, p.baseAngle * 0.2);
        targetRadius = p.baseRadius * breath + n * noiseStrength;
        targetAngle = orbitAngle;
      }

      p.currentRadius += (targetRadius - p.currentRadius) * lerpSpeed;
      let da = targetAngle - p.currentAngle;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      p.currentAngle += da * lerpSpeed;

      const x = Math.cos(p.currentAngle) * p.currentRadius;
      const y = Math.sin(p.currentAngle) * p.currentRadius;

      const pulse = 1 + Math.sin(elapsed * 0.4 + p.breathPhase) * 0.06;
      const s = p.size * pulse;
      const b = p.brightness * pulse;

      const glowRadius = s * 6;
      const coreRadius = s * 1.5;

      const gradientGlow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      gradientGlow.addColorStop(0, `rgba(255,255,255,${0.12 * b})`);
      gradientGlow.addColorStop(0.5, `rgba(255,255,255,${0.04 * b})`);
      gradientGlow.addColorStop(1, 'transparent');

      const gradientCore = ctx.createRadialGradient(x, y, 0, x, y, coreRadius);
      gradientCore.addColorStop(0, `rgba(255,255,255,${b})`);
      gradientCore.addColorStop(0.5, `rgba(255,255,255,${b * 0.3})`);
      gradientCore.addColorStop(1, 'transparent');

      ctx.fillStyle = gradientGlow;
      ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);
      ctx.fillStyle = gradientCore;
      ctx.fillRect(x - coreRadius, y - coreRadius, coreRadius * 2, coreRadius * 2);
    });

    ctx.restore();

    if (scatterPhase === 'scatter' && t - scatterStart >= scatterOutDuration) {
      scatterPhase = 'reform';
      scatterStart = t;
    } else if (scatterPhase === 'reform' && t - scatterStart >= reformDuration) {
      scatterPhase = 'idle';
    }

    if (!reducedMotion) {
      animationId = requestAnimationFrame(render);
    }
  }

  function onPointerEnter() {
    hovered = true;
  }

  function onPointerLeave() {
    hovered = false;
  }

  function onClick() {
    if (reducedMotion || scatterPhase !== 'idle') return;
    scatterPhase = 'scatter';
    scatterStart = performance.now();
  }

  initParticles();
  canvas.addEventListener('pointerenter', onPointerEnter);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('click', onClick);

  if (reducedMotion) {
    startTime = performance.now();
    render(startTime);
    return;
  }

  animationId = requestAnimationFrame(render);
})();
