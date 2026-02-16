# Geburtstags-Einladungswebsite

Personalisierte digitale Einladungen für den 40. Geburtstag von Janina und Julian. Jeder Gast erhält einen eigenen Link und kann direkt online zu- oder absagen.

## Features

- Personalisierte Einladungsseiten mit glamourösem Disco-Design
- RSVP-Formular mit Zu-/Absage, Begleitung und Nachricht
- Admin-Dashboard zur Gästeverwaltung
- Statistiken (Zusagen, Absagen, Ausstehend)
- SQLite-Datenbank - keine externe DB nötig

## Tech Stack

- **Astro** (SSR mit Node-Adapter)
- **Tailwind CSS v4**
- **SQLite** via better-sqlite3

## Voraussetzungen

- Node.js 18+

## Installation

```bash
npm install
```

## Konfiguration

`.env`-Datei anlegen (siehe `.env.example`):

```
ADMIN_PASSWORD=dein-sicheres-passwort
```

Event-Details können in `src/lib/config.ts` angepasst werden (Datum, Uhrzeit, Location, Adresse etc.).

## Development

```bash
npm run dev
```

Die Seite ist dann unter `http://localhost:4321` erreichbar.

## Build & Start

```bash
npm run build
node dist/server/entry.mjs
```

## Gästeverwaltung

1. Öffne `/admin/login` und melde dich mit dem Admin-Passwort an
2. Im Dashboard unter `/admin` kannst du:
   - Neue Gäste anlegen
   - Einladungslinks kopieren und verschicken (z.B. per WhatsApp)
   - RSVP-Status und Antworten einsehen
   - Gäste bearbeiten oder löschen

## Einladungslinks

Jeder Gast bekommt einen eindeutigen Link im Format:
```
https://deine-domain.de/{guestId}
```

Die Base-URL kann in `src/lib/config.ts` angepasst werden.
