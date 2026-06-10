import * as THREE from 'three';
import './style.css';
import {
  stoneTexture,
  cobbleTexture,
  parquetTexture,
  galleryWallTexture,
  plasterTexture,
  signTexture,
  plaqueTexture,
} from './textures';

// ---------------------------------------------------------------------------
// Layout: la fachada está en z=0; la calle se extiende hacia +z y la sala
// interior hacia -z (14 m de ancho, 16 m de fondo, 5.5 m de alto).
// ---------------------------------------------------------------------------
const ROOM_W = 14;
const ROOM_D = 16;
const ROOM_H = 5.5;
const EYE = 1.7;

const PAINTINGS = [
  { file: 'venus.jpg', title: 'El nacimiento de Venus', artist: 'Sandro Botticelli, c. 1485' },
  { file: 'primavera.jpg', title: 'La primavera', artist: 'Sandro Botticelli, c. 1480' },
  { file: 'annunciation.jpg', title: 'La Anunciación', artist: 'Fra Angelico, c. 1440' },
  { file: 'arnolfini.jpg', title: 'El matrimonio Arnolfini', artist: 'Jan van Eyck, 1434' },
  { file: 'ermine.jpg', title: 'La dama del armiño', artist: 'Leonardo da Vinci, c. 1490' },
  { file: 'federico.jpg', title: 'Federico da Montefeltro', artist: 'Piero della Francesca, c. 1470' },
  { file: 'ghirlandaio.jpg', title: 'Anciano con su nieto', artist: 'Domenico Ghirlandaio, c. 1490' },
  { file: 'weyden.jpg', title: 'Retrato de una dama', artist: 'Rogier van der Weyden, c. 1460' },
  { file: 'loredan.jpg', title: 'El dux Leonardo Loredan', artist: 'Giovanni Bellini, c. 1501' },
];

// Tres a la izquierda, tres al frente (pared del fondo) y tres a la derecha.
const SLOTS = [
  { wall: 'left', z: -4.5 }, { wall: 'left', z: -8.5 }, { wall: 'left', z: -12.5 },
  { wall: 'back', x: -4.5 }, { wall: 'back', x: 0 }, { wall: 'back', x: 4.5 },
  { wall: 'right', z: -4.5 }, { wall: 'right', z: -8.5 }, { wall: 'right', z: -12.5 },
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

const loadingManager = new THREE.LoadingManager(() => loaderEl.classList.add('done'));
const textureLoader = new THREE.TextureLoader(loadingManager);

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

function addPaintings(group: THREE.Group) {
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xc8a04a, roughness: 0.35, metalness: 0.65 });

  PAINTINGS.forEach((info, i) => {
    const slot = SLOTS[i];
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

    textureLoader.load(`/paintings/${info.file}`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const aspect = tex.image.width / tex.image.height;
      let h = 1.9;
      let w = h * aspect;
      if (w > 3.1) {
        w = 3.1;
        h = w / aspect;
      }

      const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.28, h + 0.28, 0.12), frameMat);
      holder.add(frame);
      const inner = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.13),
        new THREE.MeshStandardMaterial({ color: 0x2c1d0e, roughness: 0.7 })
      );
      holder.add(inner);
      const art = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })
      );
      art.position.z = 0.071;
      holder.add(art);

      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(0.85, 0.26),
        new THREE.MeshStandardMaterial({ map: plaqueTexture(info.title, info.artist), roughness: 0.4, metalness: 0.3 })
      );
      plaque.position.set(0, -h / 2 - 0.45, 0.02);
      holder.add(plaque);
    });

    // Foco cálido dirigido a cada cuadro.
    const spot = new THREE.SpotLight(0xffe5b8, 60, 0, 0.42, 0.65, 1.6);
    const dir = new THREE.Vector3(0, 0, 1).applyEuler(holder.rotation);
    spot.position.copy(holder.position).addScaledVector(dir, 3.2).setY(ROOM_H - 0.3);
    spot.target = holder;
    group.add(spot);
  });
}

const exterior = buildExterior();
const interior = buildInterior();
addPaintings(interior);
scene.add(exterior, interior);

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
  if (progress > 0.96) ahead.set(0, EYE + 0.15, -ROOM_D);
  camera.position.copy(pos);
  camera.lookAt(ahead);

  // Zoom suave de la lente durante la aproximación y giro libre al final.
  camera.fov = 62 - 9 * smoothstep(0, 0.4, progress);
  camera.updateProjectionMatrix();
  const look = smoothstep(0.8, 0.97, progress);
  camera.rotateY(-mouse.x * 1.1 * look);
  camera.rotateX(-mouse.y * 0.4 * look);

  // Parpadeo de las antorchas.
  for (const side of [-1, 1]) {
    const torch = exterior.getObjectByName(`torch${side}`) as THREE.PointLight | null;
    if (torch) torch.intensity = 16 + Math.sin(t * 9 + side * 7) * 2.5 + Math.sin(t * 23 + side) * 1.5;
    const flame = exterior.getObjectByName(`flame${side}`);
    if (flame) flame.scale.setScalar(1 + Math.sin(t * 11 + side * 3) * 0.18);
  }

  titleEl.style.opacity = String(1 - smoothstep(0.01, 0.12, progress));
  insideHintEl.style.opacity = String(smoothstep(0.85, 0.96, progress));

  renderer.render(scene, camera);
}
animate();
