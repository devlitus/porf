# Galería Devlitus · El Vestíbulo

Portfolio inmersivo en 3D construido con [Three.js](https://threejs.org/) y renderizado en un único `<canvas>` WebGL. La visita empieza en **El Vestíbulo**, una landing con dos cuadros enmarcados; cada uno da paso a una galería ambientada en una época distinta, y ambas exponen la misma colección: los proyectos de [devlitus](https://github.com/devlitus) en GitHub con al menos una estrella.

- **Galleria del Quattrocento** (`?gallery=xv`) — una calle nocturna del siglo XV, un palazzo de piedra con antorchas y una sala donde los proyectos cuelgan como lienzos sobre pergamino, con marcos dorados y un facistol con el CV del artífice.
- **Galería Devlitus · 2426** (`?gallery=futuro`) — una avenida de neón bajo un planeta anillado y una sala metálica donde los proyectos levitan como paneles holográficos, con un atril con el CV como registro de operador.

## Cómo se experimenta

- **Scroll** — controla el avance de la cámara por una trayectoria curva (`CatmullRomCurve3`) desde la calle hasta el interior de la sala.
- **Ratón** — orienta la mirada libremente una vez dentro de la sala.
- **Clic en una obra** — la cámara vuela hasta encuadrarla y se abre una ficha con la descripción, el lenguaje, las estrellas y enlaces a GitHub y a la demo.
- **← Volver al vestíbulo** — botón fijo en cada galería para regresar a la landing.

Los datos se obtienen en vivo de la API pública de GitHub (repos no-fork con ≥1★ y perfil), con datos de respaldo si la API no responde (`src/shared/github.ts`). Toda la geometría, texturas y luces se generan en tiempo de ejecución con `<canvas>` 2D: no hay modelos 3D ni imágenes externas, salvo las capturas de la landing.

## Stack técnico

- [Three.js](https://threejs.org/) para la escena, cámara y materiales.
- [Vite](https://vitejs.dev/) + TypeScript como entorno de desarrollo y build. Cada galería es un chunk independiente cargado con `import()` dinámico: solo se descarga la que se visita.
- [Playwright](https://playwright.dev/) para las herramientas de desarrollo en `scripts/`.

## Desarrollo

```bash
pnpm install
pnpm dev       # servidor de desarrollo
pnpm build     # type-check + build de producción
pnpm preview   # sirve el build de producción
```

Scripts auxiliares (requieren el dev server en el puerto 5180: `pnpm dev --port 5180`):

```bash
node scripts/smoke.mjs      # recorre vestíbulo → galería XV → volver → galería futurista
node scripts/previews.mjs   # regenera las capturas de la landing (public/previews/)
```

## Estructura

```
index.html                       esqueleto mínimo; todo el markup se inyecta desde src/
src/main.ts                      punto de entrada: según ?gallery= monta el vestíbulo o una galería
src/landing/                     markup, lógica y estilos del vestíbulo
src/shared/github.ts             fetch de repos y perfil de GitHub, tipos y fallbacks
src/galleries/quattrocento/      galería del siglo XV (escena, texturas, markup, estilos)
src/galleries/futurista/         galería del año 2426 (escena, texturas, markup, estilos)
public/previews/                 capturas estáticas que muestra la landing
public/paintings/                reproducciones renacentistas (sin uso actual, se conservan)
scripts/                         herramientas de desarrollo con Playwright
```

La arquitectura y sus decisiones están documentadas en [PLAN.md](PLAN.md).
