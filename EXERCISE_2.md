# Exercise 2 — Build Tooling, TypeScript & CI/CD

This is the second exercise in Advanced Web Engineering Course (CSDC). It builds directly on
**Exercise 1**, you need the ES-module split from that exercise finished first, since this exercise migrates those modules to TypeScript and puts them through a real build pipeline.

By the end of this exercise the project will: be managed by a package manager instead of a plain
`<script>` tag, run through Vite for both development and production builds, be written in
TypeScript instead of JavaScript, and be linted, formatted, and deployed automatically by GitHub
Actions whenever code is pushed.

**Out of scope for this exercise** (these come later in the course): migrating to a framework (e.g.
React)

Keep a running note of what you changed and why. As in Exercise 1, **commits are the easiest way to
demonstrate a before/after live**, e.g. "workflow fails here, passes after this commit," or "this
compiled fine in JS, here's the TypeScript error it produces and the fix."

## Corresponding manuscript reading

This exercise corresponds to the following chapters in the course manuscript:

- **Chapter 7, The Build First Mindset** — PDF pp. 55–57
- **Chapter 8, Dependencies, Package Managers, and Vite** — PDF pp. 58–62
- **Chapter 9, Linting, Formatting, and Asset Processing** — PDF pp. 63–66
- **Chapter 10, TypeScript: Static Types for JavaScript** — PDF pp. 67–78
- **Chapter 11, Continuous Integration and Automated Deployment** — PDF pp. 80–83

## Self-Check

The exercise is organized into 10 individual tasks with corresponding questions, that are
presented in class.

These checkboxes are for self-checking. Don't forget to do the actual checking of tasks you are able to present in the Moodle course. **Before class, tick only what you can genuinely demonstrate
or answer on the spot, live.**

| # | Demo | Ready? |
|---|---|---|
| 1 | Initialize the package manager & project metadata | ☐ |
| 2 | Integrate Vite as the dev server | ☐ |
| 3 | Production build & preview | ☐ |
| 4 | `package.json` scripts: lint & format | ☐ |
| 5 | TypeScript setup & first conversions | ☐ |
| 6 | Typing the domain data | ☐ |
| 7 | Full migration & resolving type errors | ☐ |
| 8 | GitHub Actions: development workflow | ☐ |
| 9 | GitHub Actions: deployment workflow | ☐ |
| 10 | Workflow triggers, permissions & failure modes | ☐ |

A demo only counts as "Ready" once **every** task and question checkbox inside it (below) is
ticked. The table above is just a fast overview, tick the boxes inside each demo first.

---

## Demo 1 — Initialize the package manager & project metadata

**Tasks**

- [ ] Choose **npm** or **pnpm** and record why you picked it over the other.
      choose pnpm because it saves depencansys diffrently as they are not 
- [ ] Initialize `package.json` for the project (name, version, description, etc. filled in properly).
      when I downloaded pnpm it automaticly created a package.json
- [ ] Add a `.gitignore` entry for `node_modules` (and any other tool output you generate in later demos, e.g. `dist/`).
- [ ] Install one real dependency (you'll add more in later demos) and show the resulting lockfile (`package-lock.json` or `pnpm-lock.yaml`) committed to the repo.
      I installed vite, that was automaticly added to the package.json

**Questions** (depend on the tasks above)

- [ ] What problem does a package manager actually solve that "download the library and put it in a folder yourself" doesn't? Be specific.
      Es lädt automatisch alle abhängigkeiten/bibiliotheken mit herunter. Wenns neue versionen gibt, muss man diese nicht manuel aktualisieren.
- [ ] What's the difference between `dependencies` and `devDependencies` in `package.json`? Which
      category will Vite, your linter/formatter, and TypeScript belong to, and why?
      
      dependencies: Code zur Laufzeit beim Endnutzer (z. B. React).
      devDependencies: Tools nur für Entwicklung und Build (Vite, Linter, TypeScript).
      Vite, Linter, TypeScript: Gehören in devDependencies, da sie den Code nur bauen/prüfen und nicht im Browser ausgeführt werden.
- [ ] What is a lockfile for, and what could go wrong for your teammates (or CI) if it weren't
      committed to the repo?
      Friert den exakten Abhängigkeitsbaum inklusive aller Unterabhängigkeiten ein.
      Teammitglieder oder CI installieren abweichende Unter-Versionen – es entstehen unvorhersehbare Bugs („Works on my machine“).

- [ ] If you chose pnpm: what does it do differently from npm regarding how `node_modules` is laid out and how disk space/install time is shared across projects? If you chose npm: what would you gain or lose by switching to pnpm on a larger project?
      Globale Ablage auf der Festplatte via Symlinks/Hard Links; spart Speicherplatz und beschleunigt Installationen massiv.
      Verhindert „Phantom Dependencies“ durch eine strikte Symlink-Struktur in node_modules. Code auf ein NPM-Paket zugreifen und dieses importieren kann, obwohl es nicht in deiner package.json als Abhängigkeit eingetragen ist

---

## Demo 2 — Integrate Vite as the dev server

**Tasks**

- [x] Install Vite and configure it for this project (restructure files if needed so Vite can find `index.html`/your modules/the `data/` and `assets/` folders correctly).
- [x] Get `vite`'s dev server running the app with the same functionality it had before. Verify every view still works, not just that the page loads.
- [x] Trigger Hot Module Replacement at least once: change something in the running app's source and observe the update happen without a full page reload.

**Questions** (depend on the tasks above)

- [x] What is the difference between how you used to run this app (a plain static file server) and running it through Vite's dev server? Name at least one thing Vite's dev server does that a plain static server doesn't.
- [x] What is Hot Module Replacement, and what specifically did you observe happen (and *not* happen, e.g. to app state) when you triggered it?
- [x] Why does an app already split into ES modules (Exercise 1) integrate naturally with a tool like Vite, compared to the original single-`<script>` version?

### Verification notes

The app runs with `pnpm dev --host 127.0.0.1` at `http://127.0.0.1:5173/`.
The existing root `index.html` is the Vite entry point and loads
`/src/main.js`; that entry point imports the Exercise 1 modules from `js/`.
The Vite config keeps the project root as the serving root and defines aliases
for `src`, `data`, `assets`, and `js`, so no data or asset folder had to be
moved.

I verified the following in the running browser:

- Dashboard: case data, statistics, recent evidence, and recent timeline events
      render correctly.
- Evidence: 18 cards render, and opening the first card shows its detail view.
- People & Locations: 6 people render, and switching to Locations shows 6
      locations.
- Timeline: 15 timeline events render.
- Workspace: bookmarks/notes areas and the hypothesis form render, including
      all loaded evidence options.

No browser `pageerror` occurred during the walkthrough.

The plain HTTP server only serves files. Vite additionally resolves the module
graph, provides the development server with fast reload/HMR, and reports module
or import errors in the browser and terminal. ES modules from Exercise 1 fit
naturally because Vite can follow their explicit `import`/`export` graph; the
original single sscript had no module graph to transform.

For the HMR demonstration, I changed the document title in `index.html` while
the Vite page was open. The browser title changed to `Project ReMotion –
Investigation Portal (Vite HMR test)` without a manual full reload. The current
`#workspace` hash stayed unchanged, so the active view was preserved. I then
restored the original title.

HMR means that Vite sends the changed module or document update over its
development WebSocket connection while the dev server keeps running. A plain
static server only serves the changed file and does not provide this update
connection. The ES-module split gives Vite an explicit import graph to follow,
transform, and update; the original single classic script did not expose that
graph.

---

## Demo 3 — Production build & preview

**Tasks**

- [x] Run the production build (`vite build`) and inspect the generated `dist/` folder.
- [x] Serve that build locally with `vite preview` (not the dev server) and confirm the app still works end-to-end from the built output.
- [x] Compare the dev-mode source with the built output for at least one file: note what changed (filenames, size, formatting/minification).

**Questions** (depend on the tasks above)

- [x] Name at least three concrete transformations Vite applied to your source when building for production (e.g. bundling, minification, hashed filenames. Pick the ones you actually observed).
- [x] Why do production filenames typically include a content hash? What problem does that solve for real deployments?
- [x] Why would you never want to deploy the dev server itself (`vite dev`/`vite`) to real users, even though it "works"?

### Verification notes

`pnpm build` completed successfully with Vite 8.3.0. Vite transformed 15
modules and generated `dist/index.html`, the hashed bundles
`dist/assets/index-DZFEhmtM.js` and `dist/assets/index-ZAWMSz9M.css`, plus the
five JSON files in `dist/data/`.

The first preview attempt exposed a real build issue: the app loaded its HTML
but stayed on the loading screen because the runtime `fetch("data/*.json")`
files were not copied into `dist/`. The Vite config now copies the existing
`data/` files during `writeBundle`, so the built app uses the same data as the
development app.

I tested `pnpm preview --host 127.0.0.1` at
`http://127.0.0.1:4173/`. The production build worked in every view: the
Dashboard rendered, Evidence showed 18 cards, People showed 6 people and 6
locations after switching tabs, Timeline showed 15 events, and Workspace
showed the hypothesis form. No browser `pageerror` occurred.

The comparison showed that `src/main.js` is 5,148 bytes as readable source,
while the generated JavaScript bundle is 26,111 bytes because it contains the
imported application modules together. Vite also minified the production
assets, emitted a separate CSS asset, and added content hashes to the asset
filenames.

The three concrete production transformations I observed are:

1. The imported JavaScript modules were bundled into one production asset.
2. JavaScript and CSS were minified, reducing formatting and whitespace.
3. CSS and JavaScript received content-hashed filenames such as
      `index-DZFEhmtM.js`.

A content hash changes when the file content changes. Browsers and CDNs can
therefore cache old hashed files for a long time while a new deployment gets a
new filename, avoiding stale-cache problems. The HTML points to the new asset.

The Vite dev server should not be deployed to users because it is a development
tool: it serves source modules, performs transformations on demand, includes
development diagnostics and HMR, and is not optimized or hardened as a
production static server. A deployment should serve the built `dist/` output
instead.

---

## Demo 4 — `package.json` scripts: lint & format

**Tasks**

- [ ] Install and configure a linter (e.g. ESLint) and a formatter (e.g. Prettier) for this TypeScript/JS project.
- [ ] Add these scripts to `package.json`: `dev`, `build`, `lint`, `lint:fix`, `format`. Each one must actually do something real when run, not just print a placeholder.
- [ ] Run `lint` and show it catching at least one real issue in your code (introduce one on purpose if you have to). Run `lint:fix` and/or `format` and show it actually changing a file.

**Questions** (depend on the tasks above)

- [ ] What's the difference between what a linter checks/fixes and what a formatter checks/fixes? Give one concrete finding from each tool on this codebase.
- [ ] Why are `lint` and `lint:fix` two separate scripts instead of one script that always auto-fixes? When would you deliberately want the non-fixing version?
- [ ] What does `npm run lint` (or `pnpm lint`) actually do under the hood? Where does npm/pnpm look for the `lint` command, and would it work if your linter weren't installed as a project dependency (only globally on your machine)?

---

## Demo 5 — TypeScript setup & first conversions

**Tasks**

- [ ] Install TypeScript and add a `tsconfig.json`. Deliberately choose your strictness settings (don't just copy a default blindly) and be ready to justify at least one setting you turned on or left off.
- [ ] Convert 2–3 of your smallest/utility modules from Exercise 1 (e.g. formatting or lookup helpers) from `.js` to `.ts`, with **no `any`**, and get them compiling with zero errors.
- [ ] Wire TypeScript into your `build`/`dev` scripts from Demo 4 so type errors are actually surfaced by your tooling, not just by your editor.

**Questions** (depend on the tasks above)

- [ ] What does the `strict` option in `tsconfig.json` actually turn on? Name at least two individual checks bundled under it, and say whether you kept it on and why.
- [ ] What is the difference between a compile-time type error and the runtime bugs you fixed in Exercise 1? Could TypeScript alone have caught any of those specific bugs? Why or why not?
- [ ] What does `any` do to TypeScript's checking for a value, and why did you avoid it in this first pass even though it would have been faster to just silence the errors with it?

---

## Demo 6 — Typing the domain data

**Tasks**

- [ ] Define TypeScript types/interfaces for the case's data model (evidence, people, locations, timeline events) that match the shape of `data/*.json`.
- [ ] Convert your data-loading module to use these types instead of untyped `fetch().json()` results.
- [ ] Pick one field that was genuinely ambiguous or inconsistent in the original JavaScript version (for example: something that could be either an id or a display name, or a date stored in more than one format) and show what modeling it as a proper TypeScript type forced you to decide.

**Questions** (depend on the tasks above)

- [ ] Walk through the ambiguous field you picked: how did the JavaScript version get away without deciding on one shape, and what did TypeScript force you to commit to?
- [ ] Is there a data-shape problem in this app that TypeScript's static types **can't** catch on their own, because the actual bad data would only show up at runtime from a JSON file, not from your code? What would you need in addition to types to catch that?
- [ ] What's the difference between an `interface` and a `type` alias for an object shape in TypeScript? Which did you use for your domain models, and does it actually matter here?

---

## Demo 7 — Full migration & resolving type errors across the app

**Tasks**

- [ ] Convert the remaining `.js` modules to `.ts`, and get the **entire app** compiling with zero TypeScript errors under the strictness settings from Demo 5.
- [ ] Find at least 3 real spots where the compiler flagged something you had to actually think about (a union type, a possibly-`undefined` value, an implicit `any`, etc.). For each, decide and record whether it pointed at a real latent bug or was "just" the compiler being pedantic.
- [ ] Confirm the app still behaves identically to the working JavaScript version — a type-safe app that behaves differently is not a successful migration.

**Questions** (depend on the tasks above)

- [ ] Show one specific type error you had to actually think about (not just silence with `any` or the `!` non-null assertion). What did it tell you about your code that plain JS review or testing hadn't?
- [ ] When (if ever) is reaching for `any` the right call during a migration like this, versus a sign you should model the type properly? Where did you draw that line?
- [ ] Did the migration reveal anything that was a genuine, previously-unnoticed bug (as opposed to just noise)? If yes, explain it. If no, explain how you're confident it was only noise.

---

## Demo 8 — GitHub Actions: development workflow

**Tasks**

- [ ] Write a GitHub Actions workflow that triggers on push (and/or pull request), checks out the repo, sets up Node.js at the right version, installs dependencies (with dependency caching), and runs your `lint` and a format-check (e.g. `prettier --check`).
- [ ] Push a commit that deliberately fails lint or format, and show the workflow **failing** in the Actions tab.
- [ ] Fix it and push again, and show the same workflow **passing**.

**Questions** (depend on the tasks above)

- [ ] What is the difference between a workflow, a job, and a step in GitHub Actions? Point to one of each in your workflow file.
- [ ] Why should lint/format run in CI at all, if it already runs (or could run) on every developer's own machine before they push?
- [ ] What is dependency caching doing in your workflow, and what would happen (both correctness- and speed-wise) if you removed it?

---

## Demo 9 — GitHub Actions: deployment workflow

**Tasks**

- [ ] Write a second workflow that, on push to your main branch (or another trigger you choose and can justify), checks out the repo, installs dependencies, lints, builds (`vite build`), and deploys the `dist/` output to GitHub Pages (or an equivalent static host).
- [ ] Confirm the deployed URL actually serves the working app end-to-end, not just that the workflow reports success.
- [ ] Make a real change, push it, and show it going live via the workflow without any manual deployment step.

**Questions** (depend on the tasks above)

- [ ] Why does the deploy workflow re-run lint and build itself, instead of trusting "it already passed on my machine" or reusing Demo 8's workflow's result directly?
- [ ] What is the actual mechanism your deploy workflow uses to publish to GitHub Pages (e.g. a dedicated deploy action publishing an artifact, pushing to a `gh-pages` branch, or something else)? Explain, concretely, what it does.
- [ ] What would you need to change in this workflow if you were deploying to a different static host instead (e.g. Netlify, Vercel, a plain server over SFTP)? What would stay the same?

---

## Demo 10 — Workflow triggers, permissions & failure modes

**Tasks**

- [ ] Deliberately commit a real TypeScript error (or a lint failure) that should block deployment, push it, and show the deploy workflow failing *before* it reaches the deploy step.
- [ ] Identify exactly what permissions and/or secrets your deploy workflow needs to publish to GitHub Pages, and show where they're configured (repository settings, the `permissions:` key in the workflow file, etc.).
- [ ] Open the run history for both workflows and be ready to read a failed run's logs live and explain, to someone unfamiliar with it, what failed and why.

**Questions** (depend on the tasks above)

- [ ] When your build step fails, does the previously-deployed version of the app stay live, get taken down, or something else? Is that the behavior you want, and why?
- [ ] What GitHub Actions permission(s) or secret(s) does your deploy workflow actually need, and where did you grant/store them? What's the security risk of over-granting permissions here?
- [ ] What's the difference between triggering a workflow `on: push`, `on: pull_request`, and `on: workflow_dispatch`? Which did you use for the development workflow (Demo 8) and which for the deployment workflow (Demo 9), and why is that pairing the right one?

---

## What to bring to class

For each of the 10 demos: your changed code/config (ideally as commits you can diff live), the actual GitHub Actions run history for both workflows (not just the files), and the ticked checkboxes
above reflecting what you can genuinely demonstrate and answer *right now*. Be ready to trigger a real workflow run live (e.g. via a small commit) on request, not just describe
one that ran earlier.
