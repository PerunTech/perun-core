# Perun Core

The front-end module of the Svarog framework, containing the core functionalities such as login, admin console, plugin management and providing the React framework to other modules.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (v8 or higher)

## Getting Started

### Installation

```bash
npm install
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Production build under `/www` (minified, no source maps, no debug) |
| `npm run build-dev` | Production build under `/www` with source maps and debug enabled |
| `npm run dev` | Starts a development server with hot reloading, source maps, and debug enabled |
| `npm run test` | Lints and auto-fixes the code using `eslint` |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GA_TRACKING_ID` | Google Analytics tracking ID | No |

For local development, create a `.env` file in the project root:

```
GA_TRACKING_ID=UA-XXXXXXXXX-X
```

For CI/CD, set the variable in your GitLab CI/CD settings under **Settings > CI/CD > Variables**.

## Local Development Guide

When developing a project that uses `perun-core` as a dependency, follow these steps to use the latest local version.

### Setting Up the Backend

Create the following files in the `backend/www` directory of your project.

**`config.js`** - Configure the server URL for your environment:

```js
window.server = 'http://<host>:<port>/services'
```

**`index.html`** - A minimal entry point that dynamically loads stylesheets and scripts:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div id="app"></div>
  <script src="config.js"></script>
  <script>
    // If your project uses spatial features, add these (see Spatial Support section):
    // window.sysCrs = 'EPSG:3857'
    // window.sysCenter = { lat: 41.294, lng: 74.597 }
  </script>
  <script>
    const assetsUrl = `${window.server}/WsConf/params/get/sys/FRONTEND_ASSETS_LOCATION`
    fetch(assetsUrl).then(response => response.json()).then(res => {
      if (res.VALUE) {
        const assetsLocation = res.VALUE
        window.assets = assetsLocation;
        const server = window.server.substring(0, window.server.lastIndexOf('/'));

        // Load locale script
        // ...

        // Load custom stylesheets — list all available stylesheets for your environment
        const stylesheets = [
          'datagrid', 'forms', 'logon', 'homepage', 'style',
          'footer', 'loading', 'topnavmenu', 'sidelistmenu',
          'adminconsole', 'modal', 'userguide', 'not-found-page',
          // ... add more as needed
        ];
        // Each entry loads: ${server}${assetsLocation}/styles/${name}.css

        // Load Font Awesome stylesheets
        // ...

        // Load title script
        // ...
      }
    }).catch(err => console.log(err))
  </script>
  <!-- Replace with your project's bundle filename -->
  <script src="bundle-name.js"></script>
</body>
</html>
```

> **Note:** This is a simplified template. The full boilerplate is available at [`docs/index.html.template`](docs/index.html.template) — copy it into your project's `backend/www` directory and customize as needed.

### Updating Perun Core Locally

1. Build perun-core:
   ```bash
   npm run build
   ```
   Or use `npm run build-dev` if you need source maps for debugging.
2. Copy `perun-core/www/perun-core.js` into your project at `your-project/node_modules/perun-core/www/`.

It is recommended to repeat this step whenever there are new changes to perun-core, so that your project has access to the latest functionality.

### Spatial Support

If your project uses spatial features, you must manually add the following parameters to `index.html` (inside a `<script>` tag, before other scripts):

```js
window.sysCrs = 'EPSG:3857'
window.sysCenter = { lat: 41.294, lng: 74.597 }
```

These values correspond to the following system parameters (`SVAROG_SYS_PARAMS`) at the environment level:

| Window Variable | System Parameter |
|-----------------|------------------|
| `window.sysCrs` | `SYS_CRS` |
| `window.sysCenter` | `SYS_CENTER` |

### Icons

Perun Core includes the [`@tabler/icons-react`](https://www.npmjs.com/package/@tabler/icons-react) icon library. Browse the available icons at https://tabler.io/icons.

When developing a project, replace the `Icon` component at `frontend/elements/util/Icon.js` with the following static import version:

```jsx
import React from 'react'
import * as TablerIcons from '@tabler/icons-react'

const Icon = ({ name, ...props }) => {
  const IconComponent = TablerIcons[name]
  return IconComponent ? <IconComponent {...props} /> : null
}

export default Icon
```

After replacing the component, rebuild perun-core:

```bash
npm run build
```

> **Why?** The default `Icon` component uses dynamic imports for code-splitting. The static import version above bundles all icons upfront, which is simpler for local development of dependent projects.
