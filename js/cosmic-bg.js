/**
 * Osmo Cosmic Background — Canvas2D
 * Starfield (120 stars), nebula (3 layers), constellation lines, mouse repel
 */

(function () {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth < 768;
  const starCount = reducedMotion ? 0 : isMobile() ? 80 : 120;

  const container = document.getElementById('cosmic-bg');
  if (!container) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  let width = 0;
  let height = 0;
  let stars = [];
  let mouse = { x: -9999, y: -9999 };
  let animationId = null;
  let startTime = 0;
  let constellationVisible = false;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (starCount > 0 && stars.length === 0) initStars();
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: 0.6 + Math.random() * 2.2,
        brightness: 0.3 + Math.random() * 0.7,
        pulseSpeed: 0.5 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: 0.1 + Math.random() * 0.4,
        hue: 0.55 + Math.random() * 0.2,
        revealDelay: Math.random() * 2.5,
        revealDuration: 0.6,
      });
    }
  }

  function hsl(h, s, l, a) {
    return `hsla(${h * 360}, ${s * 100}%, ${l * 100}%, ${a})`;
  }

  function drawStar(star, t) {
    const elapsed = (t - startTime) / 1000;
    const revealProgress = Math.min(1, Math.max(0, (elapsed - star.revealDelay) / star.revealDuration));
    if (revealProgress <= 0) return;

    let x = star.baseX;
    let y = star.baseY;

    if (!reducedMotion) {
      const driftX = Math.cos(t * 0.001 * star.driftSpeed + star.driftAngle) * 2;
      const driftY = Math.sin(t * 0.001 * star.driftSpeed * 0.7 + star.driftAngle) * 2;
      x += driftX;
      y += driftY;

      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && dist > 0) {
        const force = Math.pow(1 - dist / 150, 2) * 40;
        const nx = dx / dist;
        const ny = dy / dist;
        x += nx * force;
        y += ny * force;
      }
    }

    const pulse = Math.sin(t * 0.001 * star.pulseSpeed + star.pulsePhase) * 0.35 + 0.65;
    const size = star.size * pulse * revealProgress;
    const brightness = star.brightness * pulse * revealProgress;

    const glowRadius = size * 6;
    const coreRadius = size * 1.5;
    const hueColor = hsl(star.hue, 0.3, 0.9, 0.12 * brightness);

    const gradientGlow = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    gradientGlow.addColorStop(0, hueColor);
    gradientGlow.addColorStop(0.5, `hsla(${star.hue * 360}, 30%, 100%, 0.04)`);
    gradientGlow.addColorStop(1, 'transparent');

    const gradientCore = ctx.createRadialGradient(x, y, 0, x, y, coreRadius);
    gradientCore.addColorStop(0, `rgba(255,255,255,${brightness})`);
    gradientCore.addColorStop(0.5, `rgba(255,255,255,${brightness * 0.3})`);
    gradientCore.addColorStop(1, 'transparent');

    ctx.fillStyle = gradientGlow;
    ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);
    ctx.fillStyle = gradientCore;
    ctx.fillRect(x - coreRadius, y - coreRadius, coreRadius * 2, coreRadius * 2);
  }

  function drawNebula(t) {
    if (reducedMotion) return;
    const elapsed = (t - startTime) / 1000;
    const layers = [
      { x: 0.2, y: 0.3, speed: 0.04, color: 'rgba(38, 13, 77, 0.08)' },
      { x: 0.7, y: 0.6, speed: 0.06, color: 'rgba(13, 26, 64, 0.04)' },
      { x: 0.5, y: 0.2, speed: 0.08, color: 'rgba(38, 13, 77, 0.06)' },
    ];
    const radius = Math.min(width, height) * 0.3 * (0.9 + Math.sin(t * 0.0005) * 0.1);
    layers.forEach((layer, i) => {
      const cx = width * (layer.x + Math.sin(elapsed * layer.speed) * 0.1);
      const cy = height * (layer.y + Math.cos(elapsed * layer.speed * 0.8) * 0.1);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, layer.color);
      g.addColorStop(0.5, 'transparent');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    });
  }

  function drawConstellations(t) {
    const elapsed = (t - startTime) / 1000;
    if (elapsed < 2) return;
    if (!constellationVisible && elapsed >= 2) {
      constellationVisible = true;
    }
    const fadeProgress = Math.min(1, (elapsed - 2) / 1);
    if (fadeProgress <= 0) return;

    ctx.strokeStyle = `rgba(255,255,255,${0.08 * fadeProgress})`;
    ctx.lineWidth = 1;

    const positions = stars.map((s) => {
      let x = s.baseX;
      let y = s.baseY;
      if (!reducedMotion) {
        x += Math.cos(t * 0.001 * s.driftSpeed + s.driftAngle) * 2;
        y += Math.sin(t * 0.001 * s.driftSpeed * 0.7 + s.driftAngle) * 2;
      }
      return { x, y };
    });

    const maxConnections = 6;
    for (let i = 0; i < positions.length; i++) {
      const nearby = [];
      for (let j = 0; j < positions.length; j++) {
        if (i === j) continue;
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) nearby.push({ j, dist });
      }
      nearby.sort((a, b) => a.dist - b.dist);
      for (let k = 0; k < Math.min(maxConnections, nearby.length); k++) {
        const j = nearby[k].j;
        if (j <= i) continue;
        const dist = nearby[k].dist;
        const opacity = (1 - dist / 100) * 0.08 * fadeProgress;
        ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
        ctx.beginPath();
        ctx.moveTo(positions[i].x, positions[i].y);
        ctx.lineTo(positions[j].x, positions[j].y);
        ctx.stroke();
      }
    }
  }

  function drawCursorGlow() {
    if (mouse.x < -1000) return;
    const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 60);
    g.addColorStop(0, 'hsla(234, 30%, 100%, 0.08)');
    g.addColorStop(0.5, 'hsla(234, 30%, 100%, 0.04)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(mouse.x - 60, mouse.y - 60, 120, 120);
  }

  function render(t) {
    if (!startTime) startTime = t;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    drawNebula(t);
    if (starCount > 0) {
      drawConstellations(t);
      stars.forEach((s) => drawStar(s, t));
    }
    drawCursorGlow();

    if (!reducedMotion) {
      animationId = requestAnimationFrame(render);
    }
  }

  function onPointerMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function onPointerLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    if (starCount > 0 && stars.length !== starCount) {
      initStars();
    }
  });
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerleave', onPointerLeave);

  if (reducedMotion && starCount === 0) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (reducedMotion) {
    initStars();
    const t = performance.now();
    startTime = t - 3000;
    render(t);
    return;
  }

  animationId = requestAnimationFrame(render);
})();
