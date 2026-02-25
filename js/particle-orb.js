/**
 * Osmo Particle Orb — Canvas2D
 * 150 particles in 3 concentric rings, orbit + breathing + noise wander
 * Hover: scatter (spring). Click: scatter then reform (quintic)
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
  const baseRadius = 55;

  const rings = [
    { min: 33, max: 60 },
    { min: 60, max: 88 },
    { min: 88, max: 110 },
  ];

  let particles = [];
  let animationId = null;
  let startTime = 0;
  let hovered = false;
  let scattering = false;
  let scatterStart = 0;
  const scatterDuration = 350;

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

  function initParticles() {
    particles = [];
    let idx = 0;
    for (const ring of rings) {
      const count = Math.ceil((particleCount / 3));
      for (let i = 0; i < count && idx < particleCount; i++, idx++) {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const radius = ring.min + Math.random() * (ring.max - ring.min);
        particles.push({
          angle,
          baseRadius: radius,
          baseAngle: angle,
          size: 0.8 + Math.random() * 1.4,
          brightness: 0.4 + Math.random() * 0.5,
          orbitSpeed: (0.3 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1),
          breathPhase: Math.random() * Math.PI * 2,
          noisePhase: Math.random() * Math.PI * 2,
          targetRadius: radius,
          targetAngle: angle,
          currentRadius: radius,
          currentAngle: angle,
          velR: 0,
          velA: 0,
        });
      }
    }
  }

  function quintic(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function render(t) {
    if (!startTime) startTime = t;
    const elapsed = (t - startTime) / 1000;

    ctx.clearRect(0, 0, size, size);

    const stiffness = 5.0;
    const damping = 2.8;
    const noiseStrength = 6;
    const noiseSpeed = 1.2;

    let targetR, targetA;
    if (scattering) {
      const progress = (t - scatterStart) / scatterDuration;
      if (progress >= 1) {
        scattering = false;
        particles.forEach((p) => {
          p.targetRadius = p.baseRadius;
          p.targetAngle = p.baseAngle;
        });
      } else {
        const q = quintic(progress);
        const scatterAmount = 25 * (1 - q);
        particles.forEach((p) => {
          p.targetRadius = p.baseRadius + scatterAmount + Math.sin(p.angle * 3) * 5;
          p.targetAngle = p.baseAngle + scatterAmount * 0.1;
        });
      }
    } else if (hovered) {
      particles.forEach((p) => {
        const breath = 1 + Math.sin(elapsed * 0.5 + p.breathPhase) * 0.12;
        const scatter = 8;
        p.targetRadius = p.baseRadius * breath + scatter;
        p.targetAngle = p.baseAngle + elapsed * p.orbitSpeed + Math.sin(elapsed * 2) * 0.1;
      });
    } else {
      particles.forEach((p) => {
        const breath = 1 + Math.sin(elapsed * 0.5 + p.breathPhase) * 0.12;
        const noiseX = smoothNoise(elapsed * noiseSpeed * 0.1 + p.noisePhase, p.angle * 0.1) * 0.1;
        const noiseY = smoothNoise(p.angle * 0.1, elapsed * noiseSpeed * 0.1 + p.noisePhase * 0.5) * 0.1;
        p.targetRadius = p.baseRadius * breath + (noiseX + noiseY) * (noiseStrength / 2);
        p.targetAngle = p.baseAngle + elapsed * p.orbitSpeed;
      });
    }

    const idleBobY = reducedMotion ? 0 : Math.sin(elapsed * 0.6) * 2 + Math.sin(elapsed * 1.1) * 1;
    ctx.save();
    ctx.translate(centerX, centerY + idleBobY);

    particles.forEach((p) => {
      const dr = p.targetRadius - p.currentRadius;
      const da = p.targetAngle - p.currentAngle;
      p.velR += dr * stiffness * 0.016;
      p.velA += da * stiffness * 0.016;
      p.velR *= Math.exp(-damping * 0.016);
      p.velA *= Math.exp(-damping * 0.016);
      p.currentRadius += p.velR * 0.016 * 60;
      p.currentAngle += p.velA * 0.016 * 60;

      const x = Math.cos(p.currentAngle) * p.currentRadius;
      const y = Math.sin(p.currentAngle) * p.currentRadius;

      const pulse = 1 + Math.sin(elapsed * 0.5 + p.breathPhase) * 0.1;
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
    if (reducedMotion) return;
    scattering = true;
    scatterStart = performance.now();
  }

  initParticles();
  canvas.addEventListener('pointerenter', onPointerEnter);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('click', onClick);

  if (reducedMotion) {
    const t = performance.now();
    startTime = t;
    render(t);
    return;
  }

  animationId = requestAnimationFrame(render);
})();
