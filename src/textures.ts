import * as THREE from 'three';

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

export function stoneTexture(repeatX = 4, repeatY = 2) {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#9a8b74';
  ctx.fillRect(0, 0, 512, 512);
  const rows = 8;
  const rowH = 512 / rows;
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * 64;
    for (let c = -1; c < 4; c++) {
      const x = c * 128 + offset;
      const tone = 140 + Math.random() * 40;
      ctx.fillStyle = `rgb(${tone},${tone * 0.92},${tone * 0.76})`;
      ctx.fillRect(x + 3, r * rowH + 3, 122, rowH - 6);
    }
  }
  ctx.strokeStyle = 'rgba(50,42,32,0.5)';
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * rowH);
    ctx.lineTo(512, r * rowH);
    ctx.stroke();
  }
  noise(ctx, 512, 512, 3500, 0.08);
  return toTexture(canvas, repeatX, repeatY);
}

export function cobbleTexture(repeatX = 10, repeatY = 10) {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#3c3a38';
  ctx.fillRect(0, 0, 512, 512);
  const size = 64;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const tone = 70 + Math.random() * 35;
      ctx.fillStyle = `rgb(${tone},${tone * 0.97},${tone * 0.92})`;
      ctx.beginPath();
      ctx.ellipse(
        x * size + size / 2 + (Math.random() - 0.5) * 8,
        y * size + size / 2 + (Math.random() - 0.5) * 8,
        size / 2 - 5,
        size / 2 - 7,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  noise(ctx, 512, 512, 4000, 0.1);
  return toTexture(canvas, repeatX, repeatY);
}

export function parquetTexture(repeatX = 6, repeatY = 8) {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#5a3d22';
  ctx.fillRect(0, 0, 512, 512);
  const plankH = 64;
  for (let r = 0; r < 8; r++) {
    const offset = (r % 3) * 80;
    for (let c = -1; c < 4; c++) {
      const x = c * 170 + offset;
      const tone = 95 + Math.random() * 45;
      ctx.fillStyle = `rgb(${tone},${tone * 0.62},${tone * 0.36})`;
      ctx.fillRect(x + 2, r * plankH + 2, 166, plankH - 4);
      ctx.strokeStyle = 'rgba(40,22,8,0.55)';
      ctx.strokeRect(x + 2, r * plankH + 2, 166, plankH - 4);
      for (let g = 0; g < 6; g++) {
        ctx.strokeStyle = `rgba(60,35,15,${0.12 + Math.random() * 0.15})`;
        ctx.beginPath();
        const gy = r * plankH + 8 + Math.random() * (plankH - 16);
        ctx.moveTo(x + 4, gy);
        ctx.bezierCurveTo(x + 50, gy + (Math.random() - 0.5) * 8, x + 110, gy + (Math.random() - 0.5) * 8, x + 166, gy);
        ctx.stroke();
      }
    }
  }
  return toTexture(canvas, repeatX, repeatY);
}

export function galleryWallTexture(repeatX = 4, repeatY = 2) {
  const { canvas, ctx } = makeCanvas(512, 512);
  ctx.fillStyle = '#6e1f24';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const v = Math.random();
    ctx.fillStyle = v > 0.5 ? 'rgba(130,50,55,0.12)' : 'rgba(60,15,18,0.12)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  return toTexture(canvas, repeatX, repeatY);
}

export function plasterTexture(repeatX = 4, repeatY = 2) {
  const { canvas, ctx } = makeCanvas(256, 256);
  ctx.fillStyle = '#d8cdb6';
  ctx.fillRect(0, 0, 256, 256);
  noise(ctx, 256, 256, 2500, 0.05);
  return toTexture(canvas, repeatX, repeatY);
}

export function signTexture(text: string) {
  const { canvas, ctx } = makeCanvas(1024, 256);
  ctx.fillStyle = '#3a2716';
  ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = '#c8a44a';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, 996, 228);
  ctx.fillStyle = '#d8b85c';
  ctx.font = '90px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '18px';
  ctx.fillText(text, 512, 136);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function plaqueTexture(title: string, artist: string) {
  const { canvas, ctx } = makeCanvas(512, 160);
  ctx.fillStyle = '#b89a4f';
  ctx.fillRect(0, 0, 512, 160);
  ctx.fillStyle = '#8a7138';
  ctx.fillRect(6, 6, 500, 148);
  ctx.fillStyle = '#f5e9c8';
  ctx.textAlign = 'center';
  ctx.font = 'italic 38px Georgia, serif';
  ctx.fillText(title, 256, 66, 480);
  ctx.font = '30px Georgia, serif';
  ctx.fillText(artist, 256, 116, 480);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
