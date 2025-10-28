# Repository Guidelines

This guide orients contributors working on the large-format simulator so updates stay aligned with the analog photography experience the app models.

## Project Structure & Module Organization
- `index.tsx` boots the Vite + React app and mounts `App.tsx`, which orchestrates view state.
- `components/` contains the three primary screens (`CameraView`, `DarkroomView`, `GalleryView`) plus shared UI (`Icons.tsx`). Keep view-specific logic inside the matching file.
- `services/` hosts non-UI logic. `photoProcessor.ts` applies negative effects and randomness, while `storage.ts` persists film rolls in `localStorage`.
- `constants.ts` centralizes timing toggles (see `DEV_MODE`) and probability weights; `types.ts` defines `Film`, `PhotoError`, and `View`.
- `spec.md` captures product intent; reference it before altering flows or visuals.

## Build, Test, and Development Commands
- `npm install` installs TypeScript, Vite, and React dependencies.
- `npm run dev` starts the local dev server (http://localhost:5173 by default). Set `GEMINI_API_KEY` in `.env.local` before capturing live shots.
- `npm run build` produces the static bundle in `dist/`.
- `npm run preview` serves the production build to validate release artifacts.

## Coding Style & Naming Conventions
- Stick to TypeScript, functional React components, and hooks. Use two-space indentation and avoid semicolons unless required by TypeScript.
- Prefer `PascalCase` for components/enums and `camelCase` for functions, hooks, and state setters (`setFilms`).
- Reuse the existing utility-class vocabulary (`bg-zinc-900`, `text-zinc-500`) to maintain the darkroom aesthetic and avoid bespoke CSS.
- Keep business logic in `services/` and feed components via typed props to preserve separation of concerns.

## Testing Guidelines
- No automated test runner ships today; smoke test manually in dev mode after each change.
- Toggle `DEV_MODE` in `constants.ts` to shorten timers while exercising the Bathroom and Negatives flows.
- Validate the randomness pipeline by capturing multiple shots, developing batches, and confirming persisted state survives refreshes.
- When adding tests, colocate them beside the module (e.g., `services/photoProcessor.test.ts`) and wire the script as `npm test`.

## Commit & Pull Request Guidelines
- Write imperative, present-tense summaries under 70 characters (e.g., “Add bathroom agitation feedback”). Group related changes per commit.
- Include screenshots or screen recordings whenever UI behavior changes or animations are touched.
- Link Jira/GitHub issues in the PR body, list manual verification steps, and call out toggles or migrations contributors must run.
- Request review from at least one teammate familiar with the affected area; flag any follow-up work with checklists.
