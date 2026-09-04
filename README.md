# AWS Learning Journal

A bilingual personal knowledge garden for recording AWS study notes, labs, corrections, and SAA-C03 practice.

## Current phase

- Product state: Frontend UX Prototype
- Data: Mock only
- Authentication: Mock only, stored locally for UI review
- Backend: Not implemented
- Deployment: Not implemented

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, and Phosphor Icons. Pages are Server Components by default. Client Components are limited to theme, navigation, search, filters, practice, and fake authentication interactions.

## Run locally

Node.js 20.9 or newer is required.

```bash
npm install
npm run dev
```

Open `http://localhost:3000/en` or `http://localhost:3000/vi`.

## Prototype routes

Both `/en` and `/vi` contain matching routes for Journal, Notes, AWS, Labs, Practice, About, Login, and Signup. The sample article is at `/en/notes/s3-storage-classes`; the interactive question is at `/en/practice/demo`.

See [docs/DESIGN.md](docs/DESIGN.md) for the visual direction.
