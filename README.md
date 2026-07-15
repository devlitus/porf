# Galleria del Quattrocento

Una galería de arte inmersiva en 3D, construida con [Three.js](https://threejs.org/) y renderizada en un único `<canvas>` WebGL. La experiencia empieza en una calle nocturna frente a la fachada de un palazzo del siglo XV; al hacer scroll, la cámara avanza en travelling, cruza el arco de entrada y desemboca en una sala con nueve obras del Quattrocento colgadas en sus muros.

## Cómo se experimenta

- **Scroll** — controla el avance de la cámara por una trayectoria curva (`CatmullRomCurve3`) desde la calle hasta el interior de la sala.
- **Ratón** — orienta la mirada libremente una vez dentro de la sala, al final del recorrido.
- Toda la geometría, texturas y luces se generan en tiempo de ejecución (no hay modelos 3D externos); las únicas texturas de imagen son las propias reproducciones de los cuadros en `public/paintings`.

## Obras incluidas

Nueve reproducciones de pintura renacentista, repartidas en tres paños (izquierda, fondo, derecha): *El nacimiento de Venus* y *La primavera* de Botticelli, *La Anunciación* de Fra Angelico, *El matrimonio Arnolfini* de Van Eyck, *La dama del armiño* de Leonardo, *Federico da Montefeltro* de Piero della Francesca, *Anciano con su nieto* de Ghirlandaio, un retrato de Van der Weyden y *El dux Leonardo Loredan* de Bellini.

## Stack técnico

- [Three.js](https://threejs.org/) para la escena, cámara y materiales.
- [Vite](https://vitejs.dev/) + TypeScript como entorno de desarrollo y build.
- Texturas procedurales (piedra, adoquín, parqué, yeso, cartelas) generadas con `<canvas>` 2D, ver `src/textures.ts`.
- [Playwright](https://playwright.dev/) para capturar screenshots del recorrido en distintos puntos de scroll (`scripts/shots.mjs`), útil para revisar cambios visuales sin abrir el navegador.

## Desarrollo

```bash
pnpm install
pnpm dev       # servidor de desarrollo
pnpm build     # type-check + build de producción
pnpm preview   # sirve el build de producción
```

## Estructura

```
index.html          punto de entrada, canvas y overlays de UI
src/main.ts          escena, geometría, recorrido de cámara y animación
src/textures.ts       texturas procedurales dibujadas en <canvas>
src/style.css         estilos de los overlays (título, viñeta, loader)
public/paintings/     reproducciones de los cuadros
scripts/shots.mjs      captura screenshots del recorrido con Playwright
```
