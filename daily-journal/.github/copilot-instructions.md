# Copilot instructions for Daily Journal

## Repository overview

This repository is a small SAPUI5/Fiori application for a personal journal. The product is a single-page app rendered from `webapp` with a local in-memory JSON model; there is no backend service or persistence layer in the current implementation.

Core structure:
- `webapp/manifest.json` declares the UI5 application, routes, model config, and stylesheet entry.
- `webapp/Component.js` bootstraps the app, creates the `journal` and `device` models, and initializes routing.
- `webapp/controller/Journal.controller.js` contains almost all business logic: entry CRUD, filtering, search, mood handling, summary stats, and the dialog used for create/edit flows.
- `webapp/model/models.js` creates the JSON models used by the app.
- `webapp/view/Journal.view.xml` defines the main XML view and binds the UI directly to the `journal` JSON model.
- `webapp/css/style.css` is the custom styling entry point for the page shell and layout.
- `webapp/test/unit/controller/Journal.controller.js` contains the QUnit coverage for controller behavior and filtering logic.

The app follows the SAPUI5 pattern of `sap.ui.define(...)` modules, XML views, and `JSONModel`-backed data binding rather than a framework-agnostic component structure.

## Build, test, and lint commands

Install dependencies:
```sh
npm install
```

Run the app locally in the Fiori launchpad sandbox:
```sh
npm start
```

Run the standalone page without the FLP sandbox:
```sh
npm run start-noflp
```

Create a production build:
```sh
npm run build
```

Run linting:
```sh
npm run lint
```

Run the unit test page in the browser:
```sh
npm run unit-test
```

For a focused verification of the existing unit test flow, open the QUnit page at `webapp/test/unit/unitTests.qunit.html` from the running app or use the `unit-test` script above. There is no separate single-file test targeting command in this repo; the project uses the browser-based UI5 QUnit runner.

## Key conventions in this codebase

- Use SAPUI5 conventions: `sap.ui.define([...], function (...) { ... })`, `Controller.extend(...)`, XML views, and `JSONModel` binding.
- Keep state in the `journal` model, not in ad hoc controller variables. Observable fields such as `entries`, `filteredEntries`, `searchQuery`, `moodFilter`, `entryCount`, and `wordCount` are the canonical source of truth for the screen.
- Entry data is kept in-memory and modeled as objects with fields like `id`, `title`, `text`, `date`, and `mood`.
- Search and mood filtering are applied in `_updateViewModel()` before updating `filteredEntries`. Preserve this pattern when editing behavior.
- Use existing resource bundle keys (`i18n`) rather than hard-coded strings in the UI. Access them via `this.getOwnerComponent().getModel("i18n").getResourceBundle()` and `getText(...)`.
- UI actions use existing SAPUI5 patterns: `MessageToast` for save/delete confirmations, `MessageBox.confirm(...)` for destructive actions, and `Button`/`Dialog` event handling already defined in the controller.
- The app is intentionally small and local-first; avoid introducing a backend or new persistence layer unless explicitly requested.
- Styling is custom CSS in `webapp/css/style.css` and class names like `journalShell`, `journalPage`, `topBar`, and `entriesSection` are intended to be the styling hooks.

## Working with the journal app

- New entries are created/edited through the dialog built in `Journal.controller.js` and saved into the `journal` model.
- Summary labels and counts are derived from the actual entry list rather than kept as separate state objects.
- The `mood` values used by the app are `great`, `good`, `okay`, `low`, and `tough`, and they map to UI5 states/icons in `MOODS` inside the controller.
- Entry ordering is date-descending (`sort((a, b) => b.date.localeCompare(a.date))`). Keep the same ordering when adding logic related to display or filtering.

## Contribution pattern to follow

When changing app behavior, prefer updating the existing controller/view/model flow instead of introducing new architectural layers. The most relevant files for a feature change are typically:
1. `webapp/controller/Journal.controller.js`
2. `webapp/view/Journal.view.xml`
3. `webapp/css/style.css`
4. `webapp/test/unit/controller/Journal.controller.js`

This keeps the app aligned with the current UI5 single-screen design and the repository’s lightweight structure.
