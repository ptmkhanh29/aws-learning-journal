# 00 Local application baseline

## Goal

Run the frontend locally and confirm that the repository can produce a complete static deployment artifact.

## What we build

This step establishes the local baseline only. The frontend uses Next.js static export, and `out/` is the artifact that later deployment steps send to AWS.

The static hosting decision is documented in [Frontend deployment](../INFRASTRUCTURE_DESIGN.md#3-frontend-deployment).

## Hands-on actions

Install the locked dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000/en` and `http://localhost:3000/vi`.

Stop the development server, then run the repository checks and production build:

```bash
npm run lint
npm run build
```

## Verification

- The English and Vietnamese routes render locally.
- Lint completes without errors.
- The production build completes without a static export error.
- `out/index.html`, `out/en/index.html`, `out/vi/index.html`, and `out/_next/static/` exist.
- A deep route such as `out/en/notes/s3-storage-classes/index.html` is present.

## Expected result

The repository produces:

```text
out/
```

`out/` contains the HTML, JavaScript, CSS, fonts, and images required by the static frontend. `.next/` is build workspace data and is not the deployment artifact.

## Status

Completed.

## Next step

[01 Frontend S3](01_FRONTEND_S3.md)
