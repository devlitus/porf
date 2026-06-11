import * as THREE from 'three';
import './style.css';
import {
  metalPanelTexture,
  streetTexture,
  darkFloorTexture,
  ceilingTexture,
  neonSignTexture,
  projectCardTexture,
  holoPlaqueTexture,
  type RepoInfo,
} from './textures';

// ---------------------------------------------------------------------------
// Layout: la fachada está en z=0; la avenida se extiende hacia +z y la sala
// interior hacia -z (14 m de ancho, 16 m de fondo, 5.5 m de alto).
// Año 2426: los cuadros son proyectos de devlitus (GitHub) con ≥1 estrella,
// exhibidos como artefactos digitales del siglo XXI.
// ---------------------------------------------------------------------------
const ROOM_W = 14;
const ROOM_D = 16;
const ROOM_H = 5.5;
const EYE = 1.7;

const FALLBACK_REPOS: RepoInfo[] = [
  { name: 'chat', description: 'Aplicación web de chat con IA construida con Astro 5, React y Groq API. Persistencia local, streaming en tiempo real y diseño responsivo.', stars: 1, language: 'TypeScript', url: 'https://github.com/devlitus/chat', homepage: 'https://chat-teal-ten-21.vercel.app' },
  { name: 'csvviewer', description: 'Herramienta para visualizar y explorar archivos CSV de manera rápida y sencilla, con una interfaz intuitiva para el análisis de datos.', stars: 1, language: 'TypeScript', url: 'https://github.com/devlitus/csvviewer', homepage: 'https://csvviewer-v2.vercel.app' },
  { name: 'galleryImageSD', description: 'Aplicación web para gestionar y mostrar imágenes, desarrollada con Astro y Cloudinary. Modo oscuro/claro, galería responsiva y carga drag & drop.', stars: 1, language: 'TypeScript', url: 'https://github.com/devlitus/galleryImageSD', homepage: 'https://gallery-image-sd.vercel.app' },
  { name: 'repos-deep-learning', description: 'Repositorio dedicado al estudio e implementación de técnicas y algoritmos de aprendizaje profundo (Deep Learning).', stars: 1, language: 'Jupyter Notebook', url: 'https://github.com/devlitus/repos-deep-learning', homepage: '' },
  { name: 'travel-web', description: 'Generador de itinerarios de viaje personalizado que utiliza IA (Gemini) para crear planes detallados según destino, presupuesto y estilo de viaje.', stars: 1, language: 'TypeScript', url: 'https://github.com/devlitus/travel-web', homepage: 'https://travel-web-ashen-chi.vercel.app' },
];

async function fetchStarredRepos(): Promise<RepoInfo[]> {
  try {
    const res = await fetch('https://api.github.com/users/devlitus/repos?per_page=100');
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const data: Array<{
      name: string;
      description: string | null;
      stargazers_count: number;
      language: string | null;
      html_url: string;
      homepage: string | null;
      fork: boolean;
    }> = await res.json();
    const repos = data
      .filter((r) => !r.fork && r.stargazers_count >= 1)
      .sort((a, b) => b.stargazers_count - a.stargazers_count || a.name.localeCompare(b.name))
      .map((r) => ({
        name: r.name,
        description: r.description ?? '',
        stars: r.stargazers_count,
        language: r.language ?? '',
        url: r.html_url,
        homepage: r.homepage ?? '',
      }));
    return repos.length ? repos : FALLBACK_REPOS;
  } catch {
    return FALLBACK_REPOS;
  }
}

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
scene.background = new THREE.Color(0x05070f);
scene.fog = new THREE.Fog(0x05070f, 20, 60);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 120);

// --------------------------------- Exterior --------------------------------

function buildExterior() {
  const group = new THREE.Group();

  const streetMap = streetTexture(14, 12);
  const street = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 50),
    new THREE.MeshStandardMaterial({
      map: streetMap,
      emissiveMap: streetMap,
      emissive: 0x1c4a5e,
      emissiveIntensity: 0.55,
      roughness: 0.4,
      metalness: 0.4,
    })
  );
  street.rotation.x = -Math.PI / 2;
  street.position.set(0, 0, 25);
  group.add(street);

  // Fachada metálica con el arco de entrada recortado.
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
    new THREE.MeshStandardMaterial({ map: metalPanelTexture(6, 2), roughness: 0.55, metalness: 0.6 })
  );
  facade.position.z = -0.7;
  group.add(facade);

  // Aro de luz alrededor del arco de entrada.
  const doorRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.45, 0.06, 8, 40, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0x46e0ff })
  );
  doorRim.position.set(0, 2.6, 0.02);
  group.add(doorRim);
  for (const side of [-1, 1]) {
    const jamb = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 2.6, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x46e0ff })
    );
    jamb.position.set(side * 1.42, 1.3, 0.02);
    group.add(jamb);
  }

  // Pilones luminosos flanqueando la entrada.
  const pylonMat = new THREE.MeshStandardMaterial({ color: 0x1a2436, roughness: 0.5, metalness: 0.7 });
  for (const side of [-1, 1]) {
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.6, 0.45), pylonMat);
    pylon.position.set(side * 2.4, 2.3, 0.4);
    group.add(pylon);
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 4.2, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x46e0ff })
    );
    strip.position.set(side * 2.4, 2.3, 0.65);
    strip.name = `strip${side}`;
    group.add(strip);
    const glow = new THREE.PointLight(0x46e0ff, 16, 14, 1.8);
    glow.position.set(side * 2.4, 3.4, 0.9);
    glow.name = `glow${side}`;
    group.add(glow);
  }

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 1.15),
    new THREE.MeshBasicMaterial({ map: neonSignTexture('DEVLITUS · 2426') })
  );
  sign.position.set(0, 6.1, 0.06);
  group.add(sign);

  // Torres oscuras con ventanas de neón flanqueando la avenida.
  const buildingMat = new THREE.MeshStandardMaterial({ color: 0x10141f, roughness: 0.7, metalness: 0.5 });
  const windowColors = [0x46e0ff, 0xff4fd8, 0xffd75e];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const depth = 8 + Math.random() * 3;
      const height = 14 + Math.random() * 10;
      const building = new THREE.Mesh(new THREE.BoxGeometry(6, height, depth), buildingMat);
      building.position.set(side * (8.5 + Math.random()), height / 2, 6 + i * 11);
      group.add(building);
      for (let w = 0; w < 7; w++) {
        if (Math.random() < 0.35) continue;
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(0.5, 0.5),
          new THREE.MeshBasicMaterial({
            color: windowColors[Math.floor(Math.random() * windowColors.length)],
          })
        );
        win.position.set(
          building.position.x - side * 3.02,
          2 + w * 1.7,
          building.position.z + (Math.random() - 0.5) * depth * 0.6
        );
        win.rotation.y = -side * Math.PI / 2;
        group.add(win);
      }
      // Línea vertical luminosa en la arista de cada torre.
      const edge = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, height, 0.06),
        new THREE.MeshBasicMaterial({ color: 0x46e0ff })
      );
      edge.position.set(building.position.x - side * 3.02, height / 2, building.position.z - depth / 2);
      group.add(edge);
    }
  }

  // Cielo estrellado y un planeta anillado sobre la ciudad.
  const starPositions: number[] = [];
  for (let i = 0; i < 700; i++) {
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

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(6, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x3a5c8e, fog: false })
  );
  planet.position.set(16, 30, -75);
  group.add(planet);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(7.5, 10.5, 48),
    new THREE.MeshBasicMaterial({ color: 0x6f88b8, fog: false, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
  );
  ring.position.copy(planet.position);
  ring.rotation.set(Math.PI / 2.6, 0.4, 0);
  group.add(ring);

  const skylight = new THREE.DirectionalLight(0x4d6fbf, 0.7);
  skylight.position.set(-15, 25, 30);
  group.add(skylight);
  group.add(new THREE.HemisphereLight(0x1a2c4e, 0x05070a, 0.6));

  return group;
}

// --------------------------------- Interior --------------------------------

function buildInterior() {
  const group = new THREE.Group();

  const wallMat = new THREE.MeshStandardMaterial({ map: metalPanelTexture(4, 1.6), roughness: 0.6, metalness: 0.55 });
  const ceilingMat = new THREE.MeshStandardMaterial({ map: ceilingTexture(5, 5), roughness: 0.9 });

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_W, ROOM_D),
    new THREE.MeshStandardMaterial({ map: darkFloorTexture(5, 6), roughness: 0.25, metalness: 0.5 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.001, -ROOM_D / 2);
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, ROOM_H, -ROOM_D / 2);
  group.add(ceiling);

  // Líneas de luz en el techo en lugar de vigas.
  const lineMat = new THREE.MeshBasicMaterial({ color: 0x9fdcff });
  for (let z = -2; z >= -ROOM_D + 2; z -= 2.8) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(ROOM_W - 2, 0.05, 0.12), lineMat);
    line.position.set(0, ROOM_H - 0.03, z);
    group.add(line);
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

  // Zócalo luminoso a lo largo de las paredes.
  const trimMat = new THREE.MeshBasicMaterial({ color: 0x46e0ff });
  for (const [w, x, z, ry] of [
    [ROOM_D, -ROOM_W / 2 + 0.03, -ROOM_D / 2, Math.PI / 2],
    [ROOM_D, ROOM_W / 2 - 0.03, -ROOM_D / 2, -Math.PI / 2],
    [ROOM_W, 0, -ROOM_D + 0.03, 0],
  ] as const) {
    const trim = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.04), trimMat);
    trim.position.set(x, 0.12, z);
    trim.rotation.y = ry;
    group.add(trim);
  }

  group.add(new THREE.HemisphereLight(0xb8d8f0, 0x12203a, 1.1));
  const doorGlow = new THREE.PointLight(0x6fd8ff, 25, 12, 1.8);
  doorGlow.position.set(0, 3, -2.5);
  group.add(doorGlow);

  // Luces frías de techo a lo largo de la sala.
  for (const z of [-5, -11]) {
    const lamp = new THREE.PointLight(0xcfe8ff, 30, 18, 1.6);
    lamp.position.set(0, ROOM_H - 0.6, z);
    group.add(lamp);
  }

  return group;
}

// ------------------------------ Paneles holográficos ------------------------

interface PanelEntry {
  holder: THREE.Group;
  baseY: number;
  phase: number;
  repo: RepoInfo;
  frameMat: THREE.MeshBasicMaterial;
}

const panels: PanelEntry[] = [];
const clickables: THREE.Object3D[] = [];

function addProjects(group: THREE.Group, repos: RepoInfo[]) {
  const frameBase = new THREE.MeshBasicMaterial({ color: 0x46e0ff });
  const backingMat = new THREE.MeshStandardMaterial({ color: 0x0a1220, roughness: 0.4, metalness: 0.6 });

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

    const backing = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, h + 0.18, 0.08), backingMat);
    holder.add(backing);
    const frameMat = frameBase.clone();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.26, h + 0.26, 0.04), frameMat);
    frame.position.z = -0.01;
    holder.add(frame);

    // La pantalla es autoluminosa, como un holograma.
    const card = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: projectCardTexture(repo) })
    );
    card.position.z = 0.055;
    holder.add(card);

    card.userData.index = i;
    frame.userData.index = i;
    clickables.push(card, frame);
    panels.push({ holder, baseY: 2.6, phase: i * 1.7, repo, frameMat });

    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 0.4),
      new THREE.MeshBasicMaterial({
        map: holoPlaqueTexture(repo.name, 'devlitus · artefacto c. 2025'),
        transparent: true,
        opacity: 0.92,
      })
    );
    plaque.position.set(0, -h / 2 - 0.5, 0.02);
    holder.add(plaque);

    // Foco frío dirigido a cada panel.
    const spot = new THREE.SpotLight(0xbfe8ff, 70, 0, 0.42, 0.65, 1.6);
    const dir = new THREE.Vector3(0, 0, 1).applyEuler(holder.rotation);
    spot.position.copy(holder.position).addScaledVector(dir, 3.2).setY(ROOM_H - 0.3);
    spot.target = holder;
    group.add(spot);
  });
}

const exterior = buildExterior();
const interior = buildInterior();
scene.add(exterior, interior);

async function init() {
  const repos = await fetchStarredRepos();
  addProjects(interior, repos);
  loaderEl.classList.add('done');
}
init();

// ------------------------------ Detalle de proyecto ------------------------
// Al pulsar un panel, la cámara vuela hasta encuadrarlo (desplazado a la
// izquierda para dejar sitio a la ficha DOM que se desliza por la derecha).

const detailEl = document.getElementById('detail')!;
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
  focusLook.copy(p.holder.position).addScaledVector(focusRight, 0.95);
  focusPos.copy(focusLook).addScaledVector(focusNormal, 3.7);
  focusMatrix.lookAt(focusPos, focusLook, camera.up);
  focusQuat.setFromRotationMatrix(focusMatrix);
}

function setHovered(i: number) {
  if (i === hoveredIndex) return;
  if (hoveredIndex >= 0) panels[hoveredIndex].frameMat.color.setHex(0x46e0ff);
  if (i >= 0) panels[i].frameMat.color.setHex(0xbdf4ff);
  hoveredIndex = i;
  canvas.style.cursor = i >= 0 ? 'pointer' : '';
}

function openDetail(p: PanelEntry) {
  focusPanel = p;
  detailState = 'entering';
  openScrollY = window.scrollY;
  detailName.textContent = p.repo.name;
  detailDesc.textContent = p.repo.description || 'Sin descripción registrada.';
  detailLang.textContent = p.repo.language || '—';
  detailStars.textContent = `★ ${p.repo.stars}`;
  detailLink.href = p.repo.url;
  detailDemo.href = p.repo.homepage || '#';
  detailDemo.style.display = p.repo.homepage ? '' : 'none';
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
  // Rango amplio (±137°/±40°) para poder encuadrar los paneles laterales,
  // que desde el punto final de la sala quedan a ±90° de la mirada frontal.
  const look = smoothstep(0.8, 0.97, progress);
  const ease = Math.min(1, dt * 4);
  lookYaw += (-mouse.x * 2.4 * look - lookYaw) * ease;
  lookPitch += (-mouse.y * 0.7 * look - lookPitch) * ease;
  camera.rotateY(lookYaw);
  camera.rotateX(lookPitch);

  // Vuelo hacia el panel seleccionado (se mezcla sobre la pose libre).
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

  // Resaltado del panel bajo el cursor.
  if (detailState === 'free' && progress > 0.75) {
    ndcTmp.set(mouse.x, -mouse.y);
    raycaster.setFromCamera(ndcTmp, camera);
    const hit = raycaster.intersectObjects(clickables, false)[0];
    setHovered(hit ? (hit.object.userData.index as number) : -1);
  } else if (hoveredIndex !== -1) {
    setHovered(-1);
  }

  // Pulso de los pilones de la entrada.
  for (const side of [-1, 1]) {
    const glow = exterior.getObjectByName(`glow${side}`) as THREE.PointLight | null;
    if (glow) glow.intensity = 14 + Math.sin(t * 2 + side * 2) * 4;
    const strip = exterior.getObjectByName(`strip${side}`) as THREE.Mesh | null;
    if (strip) {
      const m = strip.material as THREE.MeshBasicMaterial;
      m.color.setHSL(0.53, 1, 0.6 + Math.sin(t * 2 + side * 2) * 0.12);
    }
  }

  // Levitación suave de los paneles holográficos y escala al pasar el cursor.
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    p.holder.position.y = p.baseY + Math.sin(t * 0.9 + p.phase) * 0.04;
    const scaleGoal = i === hoveredIndex || p === focusPanel ? 1.04 : 1;
    p.holder.scale.setScalar(p.holder.scale.x + (scaleGoal - p.holder.scale.x) * Math.min(1, dt * 8));
  }

  titleEl.style.opacity = String(1 - smoothstep(0.01, 0.12, progress));
  insideHintEl.style.opacity = String(smoothstep(0.85, 0.96, progress) * (1 - focusT));

  renderer.render(scene, camera);
}
animate();
