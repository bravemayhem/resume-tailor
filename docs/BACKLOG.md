# Backlog & memory

Product and technical backlog for Resume Tailor, plus notes we want to keep in mind.

---

## Long-term historical safety for saved master resumes

**Goal:** Keep saved master resume versions safe and available beyond a single browser/device (localStorage is not durable or portable).

**Current state:** Version history is stored only in `localStorage` (`master_resume_versions`). It’s convenient but is lost if the user clears site data, switches devices, or uses another browser.

**We should add long-term historical safety.** Below are several options, from simplest to more involved.

### Option A: Export / import JSON snapshots (no backend)

- Add “Export history” to download all saved versions (or a single version) as a JSON file.
- Add “Import history” to restore from a previously exported file.
- **Pros:** No server, no auth, works offline; user owns the file and can back it up (Drive, etc.).
- **Cons:** Manual step; user must remember to export and store the file.

### Option B: Backend persistence (e.g. Vercel Postgres, Supabase, SQLite)

- Store `master_resume` and `master_resume_versions` in a database keyed by user (e.g. anonymous id in cookie or optional account id).
- **Pros:** Automatic sync, survives clearing localStorage, can support multiple devices if we add a simple account later.
- **Cons:** Requires backend, env/config, and (if we add auth) login/signup.

### Option C: Sync to a file in the user’s cloud (e.g. Google Drive, Dropbox)

- Use OAuth to get read/write access to a single app-owned file (e.g. `resume-tailor-versions.json`) in the user’s Drive/Dropbox and sync versions there.
- **Pros:** User’s data lives in their own cloud; no app database to maintain.
- **Cons:** OAuth and provider APIs; more moving parts and consent/UX.

### Option D: Optional “save to file” on each Save

- On each “Save Changes”, optionally write a timestamped file (e.g. `resume-2026-02-16.json`) to the user’s machine via File System Access API or a download.
- **Pros:** No backend; every save can be a backup.
- **Cons:** Browser support and UX (e.g. picking a folder); not cross-device unless the user moves files.

---

## Backlog (short list)

- [ ] **Long-term historical safety** – Implement one of the options above (or a combination, e.g. A now, B later).
- [ ] (Other backlog items can be added here as we go.)

---

*Last updated: 2026-02-16*
