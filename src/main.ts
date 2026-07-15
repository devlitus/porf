import './landing/landing.css';

// Punto de entrada: según ?gallery= monta el vestíbulo o una de las galerías.
// El markup se inyecta ANTES del import() dinámico porque el código de cada
// galería corre a nivel de módulo y espera encontrar su DOM (#scene, #loader…).

type GalleryModule = { title: string; html: string };

async function bootGallery(
  bodyClass: string,
  loadMarkup: () => Promise<GalleryModule>,
  loadGallery: () => Promise<unknown>
) {
  const { title, html } = await loadMarkup();
  document.title = title;
  document.body.className = bodyClass;
  document.body.innerHTML = html;
  await loadGallery();
}

async function bootLanding() {
  const landing = await import('./landing/landing');
  document.title = landing.title;
  document.body.className = 'landing';
  document.body.innerHTML = landing.html;
  landing.start();
}

const gallery = new URLSearchParams(location.search).get('gallery');

if (gallery === 'xv') {
  bootGallery(
    'g-xv',
    () => import('./galleries/quattrocento/markup'),
    () => import('./galleries/quattrocento/gallery')
  );
} else if (gallery === 'futuro') {
  bootGallery(
    'g-futuro',
    () => import('./galleries/futurista/markup'),
    () => import('./galleries/futurista/gallery')
  );
} else {
  bootLanding();
}
