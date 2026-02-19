# Geburtstags-Einladungswebsite

Personalisierte digitale Einladungen für den 40. Geburtstag von Janina und Julian. Jeder Gast erhält einen eigenen Link und kann direkt online zu- oder absagen.

## Features

- Personalisierte Einladungsseiten mit glamourösem Disco-Design
- RSVP-Formular mit Zu-/Absage, Begleitung und Nachricht
- Admin-Dashboard zur Gästeverwaltung
- Statistiken (Zusagen, Absagen, Ausstehend)

## Tech Stack

- **Astro** (SSR mit Vercel-Adapter)
- **Tailwind CSS v4**
- **Turso** (gehostete SQLite-Datenbank) / lokale SQLite für Entwicklung

## Voraussetzungen

- Node.js 18+
- [Turso](https://turso.tech)-Datenbank (kostenlos, für Vercel-Deployment)

## Installation

```bash
npm install
```

## Konfiguration

`.env`-Datei anlegen (siehe `.env.example`):

```
ADMIN_PASSWORD=dein-sicheres-passwort

# Für Vercel-Deployment (Turso):
TURSO_DATABASE_URL=libsql://deine-db.turso.io
TURSO_AUTH_TOKEN=dein-token
```

Ohne Turso-Variablen wird automatisch eine lokale SQLite-Datei (`data/guests.db`) verwendet.

Event-Details können in `src/lib/config.ts` angepasst werden (Datum, Uhrzeit, Location, Adresse etc.).

## Development

```bash
npm run dev
```

Die Seite ist dann unter `http://localhost:4321` erreichbar.

## Vercel-Deployment

1. Turso-Datenbank erstellen:
   ```bash
   turso db create birthday-party
   turso db tokens create birthday-party
   ```
2. Repository mit Vercel verbinden
3. Environment Variables in Vercel setzen:
   - `ADMIN_PASSWORD`
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Deployen

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
