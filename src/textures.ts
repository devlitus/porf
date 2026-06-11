import * as THREE from 'three';

export interface RepoInfo {
  name: string;
  description: string;
  stars: number;
  language: string;
  url: string;
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext('2d')! };
}

function toTexture(canvas: HTMLCanvasElement, repeatX = 1, repeatY = 1) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

function noise(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number, alpha: number) {
  for (let i = 0; i < amount; i++) {
    const v = Math.floor(Math.random() * 60);
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

export function metalPanelTexture(repeatX = 4, repeatY = 2) {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#161c2a';
  ctx.fillRect(0, 0, 512, 512);
  const size = 128;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const tone = 24 + Math.random() * 14;
      ctx.fillStyle = `rgb(${tone},${tone * 1.15},${tone * 1.55})`;
      ctx.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
      ctx.strokeStyle = 'rgba(0,0,0,0.65)';
      ctx.strokeRect(x * size + 3, y * size + 3, size - 6, size - 6);
      ctx.fillStyle = 'rgba(120,200,255,0.25)';
      for (const [rx, ry] of [[10, 10], [size - 12, 10], [10, size - 12], [size - 12, size - 12]]) {
        ctx.beginPath();
        ctx.arc(x * size + rx, y * size + ry, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (Math.random() < 0.18) {
        ctx.fillStyle = Math.random() < 0.5 ? 'rgba(70,224,255,0.8)' : 'rgba(255,79,216,0.7)';
        ctx.fillRect(x * size + 14, y * size + size / 2, 26, 3);
      }
    }
  }
  noise(ctx, 512, 512, 2500, 0.06);
  return toTexture(canvas, repeatX, repeatY);
}

export function streetTexture(repeatX = 10, repeatY = 10) {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#0a0e18';
  ctx.fillRect(0, 0, 512, 512);
  noise(ctx, 512, 512, 3000, 0.08);
  ctx.strokeStyle = 'rgba(70,224,255,0.55)';
  ctx.lineWidth = 2;
  const step = 128;
  for (let i = 0; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * step, 0);
    ctx.lineTo(i * step, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * step);
    ctx.lineTo(512, i * step);
    ctx.stroke();
  }
  return toTexture(canvas, repeatX, repeatY);
}

export function darkFloorTexture(repeatX = 5, repeatY = 6) {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#0e1422';
  ctx.fillRect(0, 0, 512, 512);
  const size = 256;
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      const tone = 16 + Math.random() * 8;
      ctx.fillStyle = `rgb(${tone},${tone * 1.2},${tone * 1.7})`;
      ctx.fillRect(x * size + 2, y * size + 2, size - 4, size - 4);
    }
  }
  ctx.strokeStyle = 'rgba(70,224,255,0.18)';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, 512, 512);
  ctx.beginPath();
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 512);
  ctx.moveTo(0, 256);
  ctx.lineTo(512, 256);
  ctx.stroke();
  noise(ctx, 512, 512, 1500, 0.04);
  return toTexture(canvas, repeatX, repeatY);
}

export function ceilingTexture(repeatX = 4, repeatY = 4) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#0b101c';
  ctx.fillRect(0, 0, 256, 256);
  noise(ctx, 256, 256, 1800, 0.05);
  return toTexture(canvas, repeatX, repeatY);
}

export function neonSignTexture(text: string) {
  const { canvas, ctx } = makeCanvas(1024, 256);
  ctx.fillStyle = '#04060c';
  ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = '#2bd9ff';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#2bd9ff';
  ctx.shadowBlur = 28;
  ctx.strokeRect(16, 16, 992, 224);
  ctx.fillStyle = '#bdf4ff';
  ctx.font = 'bold 84px "Arial", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '14px';
  ctx.shadowBlur = 36;
  ctx.fillText(text, 512, 134);
  ctx.fillText(text, 512, 134);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  'Jupyter Notebook': '#da5b0b',
  Python: '#3572a5',
  Astro: '#ff5a03',
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) {
        lines[maxLines - 1] = lines[maxLines - 1].replace(/.{2}$/, '…');
        return lines;
      }
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

export function projectCardTexture(repo: RepoInfo) {
  const { canvas, ctx } = makeCanvas(1024, 640);

  const bg = ctx.createLinearGradient(0, 0, 0, 640);
  bg.addColorStop(0, '#070d1a');
  bg.addColorStop(1, '#0c1830');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 640);

  ctx.fillStyle = 'rgba(255,255,255,0.018)';
  for (let y = 0; y < 640; y += 4) ctx.fillRect(0, y, 1024, 1);

  ctx.strokeStyle = '#2bd9ff';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#2bd9ff';
  ctx.shadowBlur = 22;
  ctx.strokeRect(18, 18, 988, 604);
  ctx.shadowBlur = 0;
  ctx.lineWidth = 3;
  for (const [cx, cy, dx, dy] of [
    [18, 18, 1, 1], [1006, 18, -1, 1], [18, 622, 1, -1], [1006, 622, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * 60, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * 60);
    ctx.stroke();
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#5a7d9e';
  ctx.font = '26px "Courier New", monospace';
  ctx.letterSpacing = '6px';
  ctx.fillText('ARCHIVO DIGITAL · SIGLO XXI', 60, 88);

  ctx.fillStyle = '#7df3ff';
  ctx.font = 'bold 78px "Courier New", monospace';
  ctx.letterSpacing = '2px';
  ctx.shadowColor = '#2bd9ff';
  ctx.shadowBlur = 18;
  ctx.fillText(repo.name, 60, 180, 904);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#c9d8e8';
  ctx.font = '34px "Arial", sans-serif';
  ctx.letterSpacing = '0px';
  const lines = wrapText(ctx, repo.description || 'Sin descripción registrada.', 904, 5);
  lines.forEach((line, i) => ctx.fillText(line, 60, 254 + i * 48));

  ctx.strokeStyle = 'rgba(70,224,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 540);
  ctx.lineTo(964, 540);
  ctx.stroke();

  ctx.fillStyle = LANG_COLORS[repo.language] ?? '#8a9bb0';
  ctx.beginPath();
  ctx.arc(76, 582, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#aebfd4';
  ctx.font = '30px "Courier New", monospace';
  ctx.fillText(repo.language || '—', 100, 592);

  ctx.fillStyle = '#ffd75e';
  ctx.textAlign = 'right';
  ctx.font = 'bold 34px "Arial", sans-serif';
  ctx.fillText(`★ ${repo.stars}`, 964, 594);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function holoPlaqueTexture(line1: string, line2: string) {
  const { canvas, ctx } = makeCanvas(512, 160);
  ctx.fillStyle = '#060c18';
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = '#2bd9ff';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#2bd9ff';
  ctx.shadowBlur = 12;
  ctx.strokeRect(6, 6, 500, 148);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#d8ecf8';
  ctx.textAlign = 'center';
  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.fillText(line1, 256, 64, 480);
  ctx.fillStyle = '#6fc8e8';
  ctx.font = '26px "Courier New", monospace';
  ctx.fillText(line2, 256, 114, 480);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
