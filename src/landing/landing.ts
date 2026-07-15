export const title = 'Galería Devlitus · El Vestíbulo';

export const html = `
  <main id="landing">
    <header class="landing-head">
      <p class="kicker">Portfolio de devlitus</p>
      <h1>El Vestíbulo</h1>
      <p class="sub">Dos épocas custodian la misma colección de proyectos. Elige por qué puerta entrar.</p>
    </header>

    <div class="halls">
      <a class="hall hall-xv" href="?gallery=xv">
        <span class="frame">
          <img src="/previews/xv.jpg" alt="Vista de la Galleria del Quattrocento, siglo XV" />
        </span>
        <span class="label">
          <strong>Galleria del Quattrocento</strong>
          <em>Siglo XV · lienzos, pan de oro y antorchas</em>
        </span>
      </a>

      <a class="hall hall-futuro" href="?gallery=futuro">
        <span class="frame">
          <img src="/previews/futuro.jpg" alt="Vista de la Galería Devlitus del año 2426" />
        </span>
        <span class="label">
          <strong>Galería Devlitus · 2426</strong>
          <em>Futuro · hologramas, neón y acero</em>
        </span>
      </a>
    </div>

    <footer class="landing-foot">github.com/devlitus</footer>
  </main>
`;

// Pequeño fundido a negro antes de navegar a la galería elegida.
export function start() {
  document.querySelectorAll<HTMLAnchorElement>('#landing .hall').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(() => {
        location.href = link.href;
      }, 420);
    });
  });
}
