# Salon Dueball - Website

Moderne Website für den **Salon Dueball**, Friseur in Hollenstedt. Gebaut mit [Astro](https://astro.build/) und [Tailwind CSS](https://tailwindcss.com/).

## Entwicklung

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Struktur

```
src/
├── components/     # Wiederverwendbare Astro-Komponenten
│   ├── Navigation.astro
│   ├── Hero.astro
│   ├── Services.astro
│   ├── About.astro
│   ├── Brands.astro
│   ├── Gallery.astro
│   ├── Contact.astro
│   └── Footer.astro
├── layouts/        # Seiten-Layout
│   └── Layout.astro
├── pages/          # Seiten (Routing)
│   ├── index.astro
│   ├── impressum.astro
│   └── datenschutz.astro
└── styles/         # Globale Styles
    └── global.css
```
