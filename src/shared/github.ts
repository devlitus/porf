export interface RepoInfo {
  name: string;
  description: string;
  stars: number;
  language: string;
  url: string;
  homepage: string;
}

export interface ProfileInfo {
  name: string;
  bio: string;
  location: string;
  url: string;
  blog: string;
  repos: number;
  since: number;
}

export const FALLBACK_REPOS: RepoInfo[] = [
  { name: 'chat', description: 'Aplicación web de chat con IA construida con Astro 5, React y Groq API. Persistencia local, streaming en tiempo real y diseño responsivo.', stars: 1, language: 'TypeScript', url: 'https://github.com/devlitus/chat', homepage: 'https://chat-teal-ten-21.vercel.app' },
  { name: 'csvviewer', description: 'Herramienta para visualizar y explorar archivos CSV de manera rápida y sencilla, con una interfaz intuitiva para el análisis de datos.', stars: 1, language: 'TypeScript', url: 'https://github.com/devlitus/csvviewer', homepage: 'https://csvviewer-v2.vercel.app' },
  { name: 'galleryImageSD', description: 'Aplicación web para gestionar y mostrar imágenes, desarrollada con Astro y Cloudinary. Modo oscuro/claro, galería responsiva y carga drag & drop.', stars: 1, language: 'TypeScript', url: 'https://github.com/devlitus/galleryImageSD', homepage: 'https://gallery-image-sd.vercel.app' },
  { name: 'repos-deep-learning', description: 'Repositorio dedicado al estudio e implementación de técnicas y algoritmos de aprendizaje profundo (Deep Learning).', stars: 1, language: 'Jupyter Notebook', url: 'https://github.com/devlitus/repos-deep-learning', homepage: '' },
  { name: 'travel-web', description: 'Generador de itinerarios de viaje personalizado que utiliza IA (Gemini) para crear planes detallados según destino, presupuesto y estilo de viaje.', stars: 1, language: 'TypeScript', url: 'https://github.com/devlitus/travel-web', homepage: 'https://travel-web-ashen-chi.vercel.app' },
];

export const FALLBACK_PROFILE: ProfileInfo = {
  name: 'Carles Pedrero',
  bio: 'Developer Front-end',
  location: 'España',
  url: 'https://github.com/devlitus',
  blog: '',
  repos: 90,
  since: 2016,
};

export async function fetchProfile(): Promise<ProfileInfo> {
  try {
    const res = await fetch('https://api.github.com/users/devlitus');
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const u: {
      name: string | null;
      bio: string | null;
      location: string | null;
      html_url: string;
      blog: string | null;
      public_repos: number;
      created_at: string;
    } = await res.json();
    return {
      name: u.name ?? 'devlitus',
      bio: u.bio ?? 'Developer',
      location: u.location ?? '',
      url: u.html_url,
      blog: u.blog ?? '',
      repos: u.public_repos,
      since: new Date(u.created_at).getFullYear(),
    };
  } catch {
    return FALLBACK_PROFILE;
  }
}

export async function fetchStarredRepos(): Promise<RepoInfo[]> {
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
