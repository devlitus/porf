// El CSS se importa aquí (y no en gallery.ts) para que ya esté aplicado
// cuando main.ts inyecta este markup; si no, el HTML pinta un instante sin estilos.
import './style.css';

export const title = 'Galleria del Quattrocento';

export const html = `
  <canvas id="scene"></canvas>
  <div id="vignette"></div>

  <header id="title">
    <h1>Galleria del Quattrocento</h1>
    <p>Los proyectos de devlitus, expuestos como en el siglo XV</p>
    <div class="hint">Haz scroll para entrar<span class="arrow">↓</span></div>
  </header>

  <div id="inside-hint">Mueve el ratón para mirar · Pulsa un lienzo para ver su detalle</div>

  <aside id="detail" aria-hidden="true">
    <button id="detail-close" type="button" aria-label="Cerrar">✕</button>
    <p class="kicker" id="detail-kicker">Obra de la colección · c. 2025</p>
    <h2 id="detail-name"></h2>
    <p id="detail-desc"></p>
    <div class="meta">
      <span id="detail-lang"></span>
      <span id="detail-stars"></span>
    </div>
    <div class="actions">
      <a id="detail-demo" href="#" target="_blank" rel="noopener">Ver en vivo ⚡</a>
      <a id="detail-link" href="#" target="_blank" rel="noopener">Ver en GitHub ↗</a>
    </div>
  </aside>

  <a id="back-btn" href="./">← Volver al vestíbulo</a>

  <div id="loader"><span>Cargando la galería…</span></div>

  <div id="scroll-space"></div>
`;
