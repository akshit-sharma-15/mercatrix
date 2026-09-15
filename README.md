# Mercatrix

Workspace setup complete.

## Folder Structure

- `docs/` → project documentation
- `mercatrix-web/` → Next.js app (TypeScript + App Router + Tailwind + ESLint)

## Next.js Setup

The app is created inside `mercatrix-web` because npm package names cannot use uppercase letters, and the root folder name is `Mercatrix`.

## Install Dependencies

From workspace root:

```bash
cd mercatrix-web
npm install
```

## Run Development Server

```bash
cd mercatrix-web
npm run dev
```

Then open http://localhost:3000

## Verify Project

```bash
cd mercatrix-web
npm run lint
```