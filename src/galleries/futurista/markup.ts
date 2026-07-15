export const title = 'Galería Devlitus · 2426';

export const html = `
  <canvas id="scene"></canvas>
  <div id="vignette"></div>

  <header id="title">
    <h1>Galería Devlitus</h1>
    <p>Archivo de software del siglo XXI · Año 2426</p>
    <div class="hint">Haz scroll para entrar<span class="arrow">↓</span></div>
  </header>

  <div id="inside-hint">Mueve el ratón para mirar · Haz clic en un panel para ver su detalle</div>

  <aside id="detail" aria-hidden="true">
    <button id="detail-close" type="button" aria-label="Cerrar">✕</button>
    <p class="kicker" id="detail-kicker">Archivo digital · Siglo XXI</p>
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

  <div id="loader"><span>Inicializando archivo holográfico…</span></div>

  <div id="scroll-space"></div>
`;
