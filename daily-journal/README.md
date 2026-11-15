# Daily Journal

A responsive SAPUI5 journal app using an in-memory JSONModel for its data. This version does not require a backend service.

## Features

- Create, edit, and delete dated journal entries.
- Record a mood for each entry.
- Search entry titles and text, or filter by mood.
- See entry and word totals.
- Manage entries in the current app session; add a backend service if long-term storage is needed.

## Run locally

Requires Node.js and npm.

```sh
npm install
npm start
```

For the standalone SAPUI5 page without the Fiori launchpad sandbox:

```sh
npm run start-noflp
```

To create a production build:

```sh
npm run build
```
