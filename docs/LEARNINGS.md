# Learnings: Resume Tailor

Notes from building and debugging the app, for future reference and onboarding.

---

## PDF import (Master Resume)

### What we built
- Users can upload a PDF on the Master Resume page; the app extracts text and fills the editor so they can edit and use it for tailoring.

### What went wrong (and why)

1. **`pdf-parse` (npm)**
   - **v2.x**: No default export; Next.js couldn’t resolve it. Various import paths (`pdf-parse`, `pdf-parse/node`, subpaths) either weren’t in the package’s `exports` or triggered `Object.defineProperty called on non-object` when bundled.
   - **v1.1.1**: Worked at first, but the package’s top-level code runs a debug path when `!module.parent`: it does `Fs.readFileSync('./test/data/05-versions-space.pdf')`. In our environment that path doesn’t exist → `ENOENT` and 500 on every PDF request.

2. **`pdfjs-dist` (Mozilla)**
   - We switched to `pdfjs-dist` for extraction and implemented a small helper that uses `getDocument()` + `getTextContent()` per page.
   - When **bundled** by Next.js for the API route, the ESM entry `pdfjs-dist/legacy/build/pdf.mjs` was being webpack’d and broke at runtime with `Object.defineProperty called on non-object` (webpack runtime vs. the library’s expectations).
   - When run in **plain Node** (e.g. `node -e "import('pdfjs-dist/legacy/build/pdf.mjs')..."`), the same import worked. So the failure was **Next’s server bundling**, not the PDF or our logic.

### Fix that worked
- In **`next.config.mjs`**, add `pdfjs-dist` to `experimental.serverComponentsExternalPackages`. That keeps the package external on the server so Node loads it natively instead of via the webpack bundle, avoiding the defineProperty error.
- Extraction lives in **`lib/server/extractPdfText.ts`** (uses `pdfjs-dist` with a buffer). Both **`/api/extractpdf`** and **`/api/extract-pdf`** use this helper; the UI calls **`/api/extractpdf`** with `FormData` (no base64 size issues).

### Takeaways
- Prefer **server externals** for heavy or ESM-heavy deps in API routes when you see bundling/runtime errors that don’t reproduce in plain Node.
- Be wary of npm packages that run file I/O or test code at top level (e.g. when `!module.parent`); they can break in serverless or strict environments.
- For “upload file → extract text” in Next, **FormData** to a single API route is simpler and more robust than sending base64 JSON (which can hit body size limits and was confused with Server Actions in our case).

---

## API key handling and security

- **Env var**: `ANTHROPIC_API_KEY` in `.env.local` (or server env) is the preferred way to supply the key; it never touches the client.
- **Browser (optional)**: Key can be stored in `localStorage` and sent in the request body to `/api/tailor`; the server uses it only for that request and does not persist it.
- **Backend**: `/api/tailor` uses `apiKey || process.env.ANTHROPIC_API_KEY` so either source works. Validation and error messages are aligned so the UI can prompt for key in settings or env as appropriate.
- **Docs**: README and Settings page copy were updated to describe both options and recommend env for security.

---

## Next.js App Router quirks we hit

- **POST with FormData** to an API route was sometimes interpreted as a **Server Action** (404 + “Failed to find Server Action”). Ensuring the route was registered (no static import that broke the route) and using a clear JSON or FormData contract helped; having one canonical route (`/api/extractpdf`) also reduced confusion.
- **Static import** of a problematic dependency in an API route file can prevent the route from registering at all, leading to 404 for that path. Dynamic import inside the handler (or moving the dependency to an externalized module) keeps the route loadable.

---

*Last updated: 2026-02-16*
