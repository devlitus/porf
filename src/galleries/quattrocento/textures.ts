import * as THREE from 'three';
import type { RepoInfo, ProfileInfo } from '../../shared/github';

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

function parchmentBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#ead9ae');
  bg.addColorStop(0.5, '#e2cd9c');
  bg.addColorStop(1, '#d8bf8a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  // Manchas y vetas del papel envejecido.
  for (let i = 0; i < 900; i++) {
    const tone = 120 + Math.random() * 60;
    ctx.fillStyle = `rgba(${tone},${tone * 0.82},${tone * 0.52},0.05)`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 5, 1 + Math.random() * 3);
  }
  const edge = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
  edge.addColorStop(0, 'rgba(90,60,20,0)');
  edge.addColorStop(1, 'rgba(90,60,20,0.28)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);
}

function cornerFlourish(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number) {
  ctx.strokeStyle = 'rgba(122,46,46,0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + dx * 70, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + dy * 70);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + dx * 22, y + dy * 22, 9, 0, Math.PI * 2);
  ctx.stroke();
}

// Lienzo de época para un proyecto de GitHub: pergamino, tinta sepia y estrellas doradas.
export function projectPaintingTexture(repo: RepoInfo) {
  const { canvas, ctx } = makeCanvas(1024, 640);
  parchmentBackground(ctx, 1024, 640);

  ctx.strokeStyle = '#7a2e2e';
  ctx.lineWidth = 5;
  ctx.strokeRect(26, 26, 972, 588);
  ctx.strokeStyle = 'rgba(122,46,46,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, 944, 560);
  for (const [cx, cy, dx, dy] of [
    [26, 26, 1, 1], [998, 26, -1, 1], [26, 614, 1, -1], [998, 614, -1, -1],
  ] as const) {
    cornerFlourish(ctx, cx, cy, dx, dy);
  }

  ctx.textAlign = 'left';
  ctx.fillStyle = '#7a5a2e';
  ctx.font = '26px Georgia, serif';
  ctx.letterSpacing = '7px';
  ctx.fillText('COLLEZIONE DEVLITUS · ANNO MMXXV', 70, 96);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#3a2414';
  ctx.font = 'italic bold 74px Georgia, serif';
  ctx.fillText(repo.name, 70, 184, 884);

  ctx.strokeStyle = 'rgba(122,90,46,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(70, 212);
  ctx.lineTo(954, 212);
  ctx.stroke();

  ctx.fillStyle = '#4a3826';
  ctx.font = '33px Georgia, serif';
  const lines = wrapText(ctx, repo.description || 'Sin descripción registrada.', 884, 5);
  lines.forEach((line, i) => ctx.fillText(line, 70, 268 + i * 48));

  ctx.strokeStyle = 'rgba(122,90,46,0.45)';
  ctx.beginPath();
  ctx.moveTo(70, 544);
  ctx.lineTo(954, 544);
  ctx.stroke();

  ctx.fillStyle = '#6a4a22';
  ctx.font = 'small-caps 30px Georgia, serif';
  ctx.fillText(repo.language || '—', 70, 592);

  ctx.fillStyle = '#9c7c3a';
  ctx.textAlign = 'right';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText(`✶ ${repo.stars}`, 954, 592);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Hoja de pergamino con el CV del perfil de GitHub, para el facistol central.
export function parchmentCvTexture(profile: ProfileInfo, stack: string[]) {
  const { canvas, ctx } = makeCanvas(640, 854);
  parchmentBackground(ctx, 640, 854);

  ctx.strokeStyle = '#7a2e2e';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 600, 814);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#7a5a2e';
  ctx.font = '20px Georgia, serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('REGISTRO DEL ARTÍFICE · MMXXV', 48, 82);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#3a2414';
  ctx.font = 'italic bold 52px Georgia, serif';
  const nameParts = profile.name.split(' ');
  ctx.fillText(nameParts[0], 48, 152, 544);
  ctx.fillText(nameParts.slice(1).join(' '), 48, 210, 544);

  ctx.fillStyle = '#5a4028';
  ctx.font = 'small-caps 28px Georgia, serif';
  ctx.fillText(profile.bio, 48, 264, 544);

  ctx.strokeStyle = 'rgba(122,90,46,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(48, 300);
  ctx.lineTo(592, 300);
  ctx.stroke();

  ctx.font = '24px Georgia, serif';
  const fields: Array<[string, string]> = [
    ['Ubicación', profile.location || '—'],
    ['Activo desde', String(profile.since)],
    ['Repositorios', String(profile.repos)],
  ];
  fields.forEach(([k, v], i) => {
    ctx.fillStyle = '#7a5a2e';
    ctx.fillText(k, 48, 352 + i * 48);
    ctx.fillStyle = '#3a2414';
    ctx.fillText(v, 280, 352 + i * 48);
  });

  ctx.fillStyle = '#7a5a2e';
  ctx.fillText('Artes que domina', 48, 532);
  ctx.fillStyle = '#4a3826';
  ctx.font = 'italic 26px Georgia, serif';
  stack.slice(0, 5).forEach((lang, i) => {
    ctx.fillText(`❧ ${lang}`, 80, 578 + i * 42);
  });

  ctx.fillStyle = '#7a5a2e';
  ctx.font = '22px Georgia, serif';
  ctx.fillText('github.com/devlitus', 48, 806);

  // Sello de lacre.
  ctx.fillStyle = '#8e2f2a';
  ctx.beginPath();
  ctx.arc(548, 770, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6a1f1c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(548, 770, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#e8c8a0';
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('D', 548, 781);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
