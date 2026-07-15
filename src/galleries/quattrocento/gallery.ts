import * as THREE from 'three';
import {
  stoneTexture,
  cobbleTexture,
  parquetTexture,
  galleryWallTexture,
  plasterTexture,
  signTexture,
  plaqueTexture,
  projectPaintingTexture,
  parchmentCvTexture,
} from './textures';
import {
  fetchProfile,
  fetchStarredRepos,
  type RepoInfo,
  type ProfileInfo,
} from '../../shared/github';

// ---------------------------------------------------------------------------
// Layout: la fachada está en z=0; la calle se extiende hacia +z y la sala
// interior hacia -z (14 m de ancho, 16 m de fondo, 5.5 m de alto).
// Los cuadros son los proyectos de devlitus (GitHub) con ≥1 estrella,
// pintados como lienzos de época sobre pergamino.
// ---------------------------------------------------------------------------
const ROOM_W = 14;
const ROOM_D = 16;
const ROOM_H = 5.5;
const EYE = 1.7;

// Orden de colocación: primero el fondo y las paredes medias para que la sala
// quede equilibrada con pocos proyectos.
const SLOT_ORDER = [
  { wall: 'back', x: 0 },
  { wall: 'left', z: -8.5 },
  { wall: 'right', z: -8.5 },
  { wall: 'left', z: -4.5 },
  { wall: 'right', z: -4.5 },
  { wall: 'back', x: -4.5 },
  { wall: 'back', x: 4.5 },
  { wall: 'left', z: -12.5 },
  { wall: 'right', z: -12.5 },
] as const;

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const titleEl = document.getElementById('title')!;
const insideHintEl = document.getElementById('inside-hint')!;
const loaderEl = document.getElementById('loader')!;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10141f);
scene.fog = new THREE.Fog(0x10141f, 20, 60);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 120);

// --------------------------------- Exterior --------------------------------

function buildExterior() {
  const group = new THREE.Group();

  const street = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 50),
    new THREE.MeshStandardMaterial({ map: cobbleTexture(14, 12), roughness: 0.95 })
  );
  street.rotation.x = -Math.PI / 2;
  street.position.set(0, 0, 25);
  group.add(street);

  // Fachada de piedra con el arco de entrada recortado.
  const shape = new THREE.Shape();
  shape.moveTo(-20, 0);
  shape.lineTo(20, 0);
  shape.lineTo(20, 10);
  shape.lineTo(-20, 10);
  shape.closePath();
  const door = new THREE.Path();
  door.moveTo(-1.3, 0);
  door.lineTo(-1.3, 2.6);
  door.absarc(0, 2.6, 1.3, Math.PI, 0, true);
  door.lineTo(1.3, 0);
  door.closePath();
  shape.holes.push(door);

  const facade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.7, bevelEnabled: false }),
    new THREE.MeshStandardMaterial({ map: stoneTexture(0.3, 0.3), roughness: 0.9 })
  );
  facade.position.z = -0.7;
  group.add(facade);

  const columnMat = new THREE.MeshStandardMaterial({ map: stoneTexture(1, 3), roughness: 0.85 });
  for (const side of [-1, 1]) {
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 4.6, 16), columnMat);
    column.position.set(side * 2.1, 2.3, 0.35);
    group.add(column);
    const capital = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.3, 0.85), columnMat);
    capital.position.set(side * 2.1, 4.75, 0.35);
    group.add(capital);
  }

  const cornice = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.45, 1), columnMat);
  cornice.position.set(0, 5.1, 0.3);
  group.add(cornice);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(4.2, 1.05),
    new THREE.MeshStandardMaterial({ map: signTexture('GALLERIA'), roughness: 0.6 })
  );
  sign.position.set(0, 6.1, 0.06);
  group.add(sign);

  // Edificios oscuros flanqueando la calle para guiar la perspectiva.
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: 1 });
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xffb45e });
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const depth = 8 + Math.random() * 3;
      const height = 7 + Math.random() * 4;
      const building = new THREE.Mesh(new THREE.BoxGeometry(6, height, depth), buildingMat);
      building.position.set(side * (8.5 + Math.random()), height / 2, 6 + i * 11);
      group.add(building);
      for (let w = 0; w < 3; w++) {
        if (Math.random() < 0.4) continue;
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.85), windowMat);
        win.position.set(
          building.position.x - side * 3.02,
          2.2 + w * 1.9,
          building.position.z + (Math.random() - 0.5) * depth * 0.6
        );
        win.rotation.y = -side * Math.PI / 2;
        group.add(win);
      }
    }
  }

  // Antorchas a ambos lados de la puerta.
  for (const side of [-1, 1]) {
    const sconce = new THREE.Mesh(
      new THREE.ConeGeometry(0.13, 0.55, 8),
      new THREE.MeshStandardMaterial({ color: 0x3a2c1a, roughness: 0.8 })
    );
    sconce.position.set(side * 3.2, 3.0, 0.25);
    group.add(sconce);
    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffc66a })
    );
    flame.position.set(side * 3.2, 3.38, 0.25);
    flame.name = `flame${side}`;
    group.add(flame);
    const torch = new THREE.PointLight(0xff9540, 18, 14, 1.8);
    torch.position.set(side * 3.2, 3.45, 0.7);
    torch.name = `torch${side}`;
    group.add(torch);
  }

  // Cielo estrellado del anochecer.
  const starPositions: number[] = [];
  for (let i = 0; i < 500; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.45;
    const r = 90;
    starPositions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi) + 5,
      r * Math.sin(phi) * Math.sin(theta)
    );
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xbcc8ff, size: 0.35, sizeAttenuation: true, fog: false })
  );
  group.add(stars);

  const moonlight = new THREE.DirectionalLight(0x8899cc, 0.7);
  moonlight.position.set(-15, 25, 30);
  group.add(moonlight);
  group.add(new THREE.HemisphereLight(0x33405e, 0x14110d, 0.5));

  return group;
}

// --------------------------------- Interior --------------------------------

function buildInterior() {
  const group = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({ map: galleryWallTexture(4, 1.6), roughness: 0.9 });
  const plasterMat = new THREE.MeshStandardMaterial({ map: plasterTexture(5, 5), roughness: 0.95 });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_W, ROOM_D),
    new THREE.MeshStandardMaterial({ map: parquetTexture(5, 6), roughness: 0.55, metalness: 0.05 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.001, -ROOM_D / 2);
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), plasterMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, ROOM_H, -ROOM_D / 2);
  group.add(ceiling);

  const beamMat = new THREE.MeshStandardMaterial({ color: 0x4a2f18, roughness: 0.85 });
  for (let z = -2; z >= -ROOM_D + 2; z -= 2.8) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W, 0.28, 0.32), beamMat);
    beam.position.set(0, ROOM_H - 0.14, z);
    group.add(beam);
  }

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D, ROOM_H), wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-ROOM_W / 2, ROOM_H / 2, -ROOM_D / 2);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D, ROOM_H), wallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(ROOM_W / 2, ROOM_H / 2, -ROOM_D / 2);
  group.add(rightWall);

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_H), wallMat);
  backWall.position.set(0, ROOM_H / 2, -ROOM_D);
  group.add(backWall);

  // Pared frontal interior (la cara de atrás de la fachada), con el mismo arco.
  const shape = new THREE.Shape();
  shape.moveTo(-ROOM_W / 2, 0);
  shape.lineTo(ROOM_W / 2, 0);
  shape.lineTo(ROOM_W / 2, ROOM_H);
  shape.lineTo(-ROOM_W / 2, ROOM_H);
  shape.closePath();
  const door = new THREE.Path();
  door.moveTo(-1.3, 0);
  door.lineTo(-1.3, 2.6);
  door.absarc(0, 2.6, 1.3, Math.PI, 0, true);
  door.lineTo(1.3, 0);
  door.closePath();
  shape.holes.push(door);
  const frontWall = new THREE.Mesh(new THREE.ShapeGeometry(shape), wallMat);
  frontWall.rotation.y = Math.PI;
  frontWall.position.z = -0.71;
  group.add(frontWall);

  // Zócalo dorado a lo largo de las paredes.
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x9c7c3a, roughness: 0.4, metalness: 0.6 });
  for (const [w, x, z, ry] of [
    [ROOM_D, -ROOM_W / 2 + 0.03, -ROOM_D / 2, Math.PI / 2],
    [ROOM_D, ROOM_W / 2 - 0.03, -ROOM_D / 2, -Math.PI / 2],
    [ROOM_W, 0, -ROOM_D + 0.03, 0],
  ] as const) {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(w, 0.18, 0.05), trimMat);
    trim.position.set(x, 0.09, z);
    trim.rotation.y = ry;
    group.add(trim);
  }

  group.add(new THREE.HemisphereLight(0xfff2dc, 0x3a2a18, 0.55));
  const doorGlow = new THREE.PointLight(0xffd9a0, 25, 12, 1.8);
  doorGlow.position.set(0, 3, -2.5);
  group.add(doorGlow);

  return group;
}

// ------------------------------ Lienzos de proyecto ------------------------

interface PanelEntry {
  holder: THREE.Group;
  highlightMat: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
  baseColor: number;
  hoverColor: number;
  focusDist: number;
  lookOffset: number;
  repo?: RepoInfo;
  profile?: ProfileInfo;
}

const panels: PanelEntry[] = [];
const clickables: THREE.Object3D[] = [];

function addProjects(group: THREE.Group, repos: RepoInfo[]) {
  const innerMat = new THREE.MeshStandardMaterial({ color: 0x2c1d0e, roughness: 0.7 });

  repos.slice(0, SLOT_ORDER.length).forEach((repo, i) => {
    const slot = SLOT_ORDER[i];
    const holder = new THREE.Group();

    if (slot.wall === 'left') {
      holder.position.set(-ROOM_W / 2 + 0.06, 2.6, slot.z);
      holder.rotation.y = Math.PI / 2;
    } else if (slot.wall === 'right') {
      holder.position.set(ROOM_W / 2 - 0.06, 2.6, slot.z);
      holder.rotation.y = -Math.PI / 2;
    } else {
      holder.position.set(slot.x, 2.6, -ROOM_D + 0.06);
    }
    group.add(holder);

    const w = 3.0;
    const h = w * (640 / 1024);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0xc8a04a, roughness: 0.35, metalness: 0.65 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.28, h + 0.28, 0.12), frameMat);
    holder.add(frame);
    const inner = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.13), innerMat);
    holder.add(inner);

    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshStandardMaterial({ map: projectPaintingTexture(repo), roughness: 0.85 })
    );
    art.position.z = 0.071;
    holder.add(art);

    art.userData.index = i;
    frame.userData.index = i;
    clickables.push(art, frame);
    panels.push({
      holder,
      highlightMat: frameMat,
      baseColor: 0xc8a04a,
      hoverColor: 0xf0cc7a,
      repo,
      focusDist: 3.7,
      lookOffset: 0.95,
    });

    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(0.85, 0.26),
      new THREE.MeshStandardMaterial({ map: plaqueTexture(repo.name, 'devlitus · c. 2025'), roughness: 0.4, metalness: 0.3 })
    );
    plaque.position.set(0, -h / 2 - 0.45, 0.02);
    holder.add(plaque);

    // Foco cálido dirigido a cada cuadro.
    const spot = new THREE.SpotLight(0xffe5b8, 60, 0, 0.42, 0.65, 1.6);
    const dir = new THREE.Vector3(0, 0, 1).applyEuler(holder.rotation);
    spot.position.copy(holder.position).addScaledVector(dir, 3.2).setY(ROOM_H - 0.3);
    spot.target = holder;
    group.add(spot);
  });
}

// Facistol central de madera con el CV del artífice en pergamino.
function addAtril(group: THREE.Group, profile: ProfileInfo, stack: string[]) {
  const z = -11.4;
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a2f18, roughness: 0.75 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0x9c7c3a, roughness: 0.4, metalness: 0.6 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.1, 24), wood);
  base.position.set(0, 0.05, z);
  group.add(base);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.022, 8, 40), goldMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, 0.11, z);
  group.add(ring);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.22, 1.05, 16), wood);
  column.position.set(0, 0.6, z);
  group.add(column);

  const desk = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.05, 0.55), wood);
  desk.position.set(0, 1.16, z);
  desk.rotation.x = 0.32;
  group.add(desk);

  const deskTrim = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.02, 0.05), goldMat);
  deskTrim.position.set(0, 1.1, z + 0.25);
  deskTrim.rotation.x = 0.32;
  group.add(deskTrim);

  // Vela cálida iluminando el facistol.
  const candle = new THREE.PointLight(0xffc97a, 8, 5, 1.8);
  candle.position.set(0, 2.2, z + 0.5);
  group.add(candle);

  // Hoja de pergamino apoyada sobre el atril, como página de lectura.
  const sheets = new THREE.Group();
  sheets.position.set(0, 1.42, z + 0.05);
  sheets.rotation.x = -0.9;
  group.add(sheets);

  const sheetTex = parchmentCvTexture(profile, stack);
  const sheetMat = new THREE.MeshStandardMaterial({ map: sheetTex, roughness: 0.85 });
  const main = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.88), sheetMat);
  sheets.add(main);
  for (const side of [-1, 1]) {
    const under = new THREE.Mesh(
      new THREE.PlaneGeometry(0.66, 0.88),
      new THREE.MeshStandardMaterial({ map: sheetTex, roughness: 0.9 })
    );
    under.position.set(side * 0.05, -0.02, -0.012 * (side + 2));
    under.rotation.z = side * 0.06;
    sheets.add(under);
  }

  const index = panels.length;
  sheets.children.forEach((m) => (m.userData.index = index));
  base.userData.index = index;
  desk.userData.index = index;
  clickables.push(...sheets.children, base, desk);
  panels.push({
    holder: sheets,
    highlightMat: sheetMat,
    baseColor: 0xffffff,
    hoverColor: 0xffe2b0,
    profile,
    focusDist: 1.7,
    lookOffset: 0.42,
  });
}

const exterior = buildExterior();
const interior = buildInterior();
scene.add(exterior, interior);

async function init() {
  const [repos, profile] = await Promise.all([fetchStarredRepos(), fetchProfile()]);
  addProjects(interior, repos);
  const stack = [...new Set(repos.map((r) => r.language).filter(Boolean))];
  addAtril(interior, profile, stack.length ? stack : ['TypeScript']);
  loaderEl.classList.add('done');
}
init();

// ------------------------------ Detalle de proyecto ------------------------
// Al pulsar un lienzo, la cámara vuela hasta encuadrarlo (desplazado a la
// izquierda para dejar sitio a la ficha DOM que se desliza por la derecha).

const detailEl = document.getElementById('detail')!;
const detailKicker = document.getElementById('detail-kicker')!;
const detailName = document.getElementById('detail-name')!;
const detailDesc = document.getElementById('detail-desc')!;
const detailLang = document.getElementById('detail-lang')!;
const detailStars = document.getElementById('detail-stars')!;
const detailLink = document.getElementById('detail-link') as HTMLAnchorElement;
const detailDemo = document.getElementById('detail-demo') as HTMLAnchorElement;

let detailState: 'free' | 'entering' | 'open' | 'leaving' = 'free';
let focusPanel: PanelEntry | null = null;
let focusT = 0;
let openScrollY = 0;
let hoveredIndex = -1;

const raycaster = new THREE.Raycaster();
const ndcTmp = new THREE.Vector2();
const focusPos = new THREE.Vector3();
const focusQuat = new THREE.Quaternion();
const focusNormal = new THREE.Vector3();
const focusRight = new THREE.Vector3();
const focusLook = new THREE.Vector3();
const focusMatrix = new THREE.Matrix4();

function computeFocusPose(p: PanelEntry) {
  focusNormal.set(0, 0, 1).applyEuler(p.holder.rotation);
  focusRight.set(1, 0, 0).applyEuler(p.holder.rotation);
  focusLook.copy(p.holder.position).addScaledVector(focusRight, p.lookOffset);
  focusPos.copy(focusLook).addScaledVector(focusNormal, p.focusDist);
  focusMatrix.lookAt(focusPos, focusLook, camera.up);
  focusQuat.setFromRotationMatrix(focusMatrix);
}

function setHovered(i: number) {
  if (i === hoveredIndex) return;
  if (hoveredIndex >= 0) {
    const prev = panels[hoveredIndex];
    prev.highlightMat.color.setHex(prev.baseColor);
  }
  if (i >= 0) {
    const next = panels[i];
    next.highlightMat.color.setHex(next.hoverColor);
  }
  hoveredIndex = i;
  canvas.style.cursor = i >= 0 ? 'pointer' : '';
}

function openDetail(p: PanelEntry) {
  focusPanel = p;
  detailState = 'entering';
  openScrollY = window.scrollY;
  if (p.profile) {
    detailKicker.textContent = 'El artífice de la colección';
    detailName.textContent = p.profile.name;
    detailDesc.textContent = `${p.profile.bio}. En activo desde ${p.profile.since}, con ${p.profile.repos} repositorios públicos en su taller.`;
    detailLang.textContent = p.profile.location || '—';
    detailStars.textContent = `${p.profile.repos} repos`;
    detailLink.href = p.profile.url;
    detailLink.textContent = 'Perfil de GitHub ↗';
    detailDemo.href = p.profile.blog || '#';
    detailDemo.textContent = 'Portfolio ⚡';
    detailDemo.style.display = p.profile.blog ? '' : 'none';
  } else if (p.repo) {
    detailKicker.textContent = 'Obra de la colección · c. 2025';
    detailName.textContent = p.repo.name;
    detailDesc.textContent = p.repo.description || 'Sin descripción registrada.';
    detailLang.textContent = p.repo.language || '—';
    detailStars.textContent = `✶ ${p.repo.stars}`;
    detailLink.href = p.repo.url;
    detailLink.textContent = 'Ver en GitHub ↗';
    detailDemo.href = p.repo.homepage || '#';
    detailDemo.textContent = 'Ver en vivo ⚡';
    detailDemo.style.display = p.repo.homepage ? '' : 'none';
  }
  setHovered(-1);
}

function closeDetail() {
  if (detailState === 'free' || detailState === 'leaving') return;
  detailState = 'leaving';
  detailEl.classList.remove('open');
  detailEl.setAttribute('aria-hidden', 'true');
}

let downX = 0;
let downY = 0;
canvas.addEventListener('pointerdown', (e) => {
  downX = e.clientX;
  downY = e.clientY;
});
canvas.addEventListener('pointerup', (e) => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
  if (detailState === 'entering' || detailState === 'open') {
    closeDetail();
    return;
  }
  if (progress < 0.75) return;
  ndcTmp.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndcTmp, camera);
  const hit = raycaster.intersectObjects(clickables, false)[0];
  if (hit) openDetail(panels[hit.object.userData.index as number]);
});

document.getElementById('detail-close')!.addEventListener('click', closeDetail);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDetail();
});

// ----------------------------- Recorrido de cámara -------------------------

const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, EYE, 26),
  new THREE.Vector3(0, EYE, 14),
  new THREE.Vector3(0, EYE, 5),
  new THREE.Vector3(0, EYE, -0.35),
  new THREE.Vector3(0, EYE, -3.5),
  new THREE.Vector3(0, EYE + 0.1, -8.25),
]);

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

let targetProgress = 0;
let progress = 0;
const mouse = { x: 0, y: 0 };

function readScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  targetProgress = max > 0 ? window.scrollY / max : 0;
  if ((detailState === 'entering' || detailState === 'open') && Math.abs(window.scrollY - openScrollY) > 150) {
    closeDetail();
  }
}
window.addEventListener('scroll', readScroll, { passive: true });
readScroll();

window.addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const pos = new THREE.Vector3();
const ahead = new THREE.Vector3();
const END_TARGET = new THREE.Vector3(0, EYE + 0.15, -ROOM_D);
// El giro con el ratón se interpola para que al hacer scroll (cuando `look`
// cambia) la cámara no pegue latigazos al recuperar la orientación del camino.
let lookYaw = 0;
let lookPitch = 0;
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  const t = now / 1000;

  progress += (targetProgress - progress) * Math.min(1, dt * 4.5);

  path.getPointAt(progress, pos);
  path.getPointAt(Math.min(1, progress + 0.04), ahead);
  ahead.lerp(END_TARGET, smoothstep(0.88, 0.98, progress));
  camera.position.copy(pos);
  camera.lookAt(ahead);

  // Zoom suave de la lente durante la aproximación y giro libre al final.
  camera.fov = 62 - 9 * smoothstep(0, 0.4, progress);
  camera.updateProjectionMatrix();
  // Rango amplio (±137°/±40°) para poder encuadrar los lienzos laterales,
  // que desde el punto final de la sala quedan a ±90° de la mirada frontal.
  const look = smoothstep(0.8, 0.97, progress);
  const ease = Math.min(1, dt * 4);
  lookYaw += (-mouse.x * 2.4 * look - lookYaw) * ease;
  lookPitch += (-mouse.y * 0.7 * look - lookPitch) * ease;
  camera.rotateY(lookYaw);
  camera.rotateX(lookPitch);

  // Vuelo hacia el lienzo seleccionado (se mezcla sobre la pose libre).
  const focusGoal = detailState === 'entering' || detailState === 'open' ? 1 : 0;
  focusT += (focusGoal - focusT) * Math.min(1, dt * 3.2);
  if (focusPanel) {
    computeFocusPose(focusPanel);
    const k = focusT * focusT * (3 - 2 * focusT);
    camera.position.lerp(focusPos, k);
    camera.quaternion.slerp(focusQuat, k);
    if (detailState === 'entering' && focusT > 0.75) {
      detailState = 'open';
      detailEl.classList.add('open');
      detailEl.setAttribute('aria-hidden', 'false');
    }
    if (detailState === 'leaving' && focusT < 0.02) {
      detailState = 'free';
      focusPanel = null;
      focusT = 0;
    }
  }

  // Resaltado del lienzo bajo el cursor.
  if (detailState === 'free' && progress > 0.75) {
    ndcTmp.set(mouse.x, -mouse.y);
    raycaster.setFromCamera(ndcTmp, camera);
    const hit = raycaster.intersectObjects(clickables, false)[0];
    setHovered(hit ? (hit.object.userData.index as number) : -1);
  } else if (hoveredIndex !== -1) {
    setHovered(-1);
  }

  // Parpadeo de las antorchas.
  for (const side of [-1, 1]) {
    const torch = exterior.getObjectByName(`torch${side}`) as THREE.PointLight | null;
    if (torch) torch.intensity = 16 + Math.sin(t * 9 + side * 7) * 2.5 + Math.sin(t * 23 + side) * 1.5;
    const flame = exterior.getObjectByName(`flame${side}`);
    if (flame) flame.scale.setScalar(1 + Math.sin(t * 11 + side * 3) * 0.18);
  }

  titleEl.style.opacity = String(1 - smoothstep(0.01, 0.12, progress));
  insideHintEl.style.opacity = String(smoothstep(0.85, 0.96, progress) * (1 - focusT));

  renderer.render(scene, camera);
}
animate();
