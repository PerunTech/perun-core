# Changelog

All notable changes to this project will be documented in this file.

---

## [v4.5.5] - 2026-06-23

### New Features
- **JSON editor**: Replaced the legacy JSON editor/viewer with Monaco editor; extracted JsonEditor utilities; fixed `handleFormat` to populate `editorRef` on mount
- **reCAPTCHA**: Load script conditionally based on the `GOOGLE_CAPTCHA_ENABLED` system parameter
- **Google Analytics**: Load script conditionally based on the `GOOGLE_ANALYTICS_ID` system parameter
- **Tasks**: New tasks component with supporting logic and web services
- **LabelEditor**: Refactored into focused sub-components; enabled in the UI
- **Server unavailability**: Graceful handling on page load with SweetAlert2 fallback; applied to `index.html` template
- **Login CSS**: New login-specific classes replacing generic logon CSS classes

### CodeList Editor
- Fully refactored the CodeList editor
- Auto-search new codelist after save
- Children sorted by `SORT_ORDER` in both the grid and exported tree
- Pre-fill and disable `PARENT_CODE_VALUE` when adding child codes; disable when editing existing codelist entries
- Breadcrumb updated on edit
- Export always includes the full tree from root, regardless of current navigation depth

### Svarog Tables & Fields Admin
- Added `ConfigTables` component for config-type tables; `SvarogTables` now filtered to non-config tables only
- Inline field editor with `GUI_METADATA` badge and editing
- New-table creation flow and fixed table edit form submission
- Switched fields fetch to `WsCore/children`
- Field label displayed in the editor; field export no longer drops server-only values

### Export UX
- Auto-select locale when only one is configured
- Trigger export on locale select
- Export loading state; fixed preview race condition on cancel
- Close modal after export; improved empty-fields hint text

### UI / UX
- `SystemConfLogs`: improved grid config and log preview
- `CACHE_TYPE`: show translated value
- Labels: always show the label (not only when translated); show index as title

### Bug Fixes
- Axios: suppress alert on cancelled requests; handle connection refused errors
- Abort in-flight form fetches; deduplicate `getRowField`; guard export on empty breadcrumb
- `onInputChange`: fix spreading array `formData` into an object (losing array type)
- `isJSON`: drop `strcmp` dependency, check objects directly, handle null
- CodeList: fix stale search grid after root node delete
- Alert when `BUSINESS_OBJECT_TYPE_NAME` parameter is missing
- Export locale auto-select: use `useEffect` for locales arriving after modal opens; validate parsed array before use

### Build & Tooling
- CI: updated Node.js version; switched to `npm ci` with `.npm` cache; webpack filesystem cache with absolute cache path
- Overrode `dompurify` to 3.4.0
- Multiple `npm audit` fixes

### Docs
- Clarified Google Analytics and reCAPTCHA configuration docs

---

## [v4.5.4] - 2026-04-17

### Build & Tooling
- Parallelized Babel transpilation; narrowed `preset-env` targets for smaller bundles
- Modernized and cleaned up Webpack config; added filesystem cache
- Updated `engines` property in `package.json`
- Upgraded `maven-bundle-plugin` to 5.1.9
- Multiple `npm audit` fixes across several commits

### ESLint
- Migrated from ESLint v8 to v9

### Dependencies
- Replaced `xlsx` with `xlsx-js-style`

### Features
- **Session token**: sent as `sessionId` header on every request
- **Reload all grids**: new logic to reload all grids at once
- **Selected rows**: improved tracking when sorting/filtering is applied; reset filters and filtered rows
- **Tables & Fields**: components for managing DB tables and fields, download as JSON, handle add/delete
- **Workflow**: added workflow item params to perun-core
- **Icons**: new icon handling approach; fixed broken imports
- **User management**: new user management web services
- **Router**: fixes for the reload issues

### UI / UX
- New and updated labels across multiple commits

### Docs & Config
- Rewrote README with reorganized dev guide; added prerequisites and index.html template
- Standardized `client.js` comments; extracted GA tracking ID to env variable
- Various clean-ups and minor clarifications

---

## [v4.5.3] - 2026-01-22

### General Updates
- Added an admin console component for managing the `PERUN_MENU` table
- Added an admin console component for managing the `SVAROG_WORKFLOW_AUTOMATON` table
- Added the `@tabler/icons-react` package and a component for displaying the icons

### Improvements
- Added more utility functions to avoid duplicating code across projects/modules

### Clean-up
- Removed unused/deprecated `Module Menu` and `Context Menu` components

---

## [v4.5.2] - 2025-09-19

### General Updates
- Added generic functions to avoid code duplication
- Added language switch functionality to `PerunNavbar`

### Improvements
- Formatting
- Card classes
- Error handling

---

## [v4.5.1] - 2025-07-01

### Misc
- Removed naits check in `Router.js`

---

## [v4.5.0] - 2025-06-30

### General Updates
- Updated outdated dependencies in `package.json` to improve stability and compatibility

### New Features
- **My Profile**: Added a new user profile section for easier account management
- **AlertUserV2**: Introduced an enhanced alert system for improved user notifications

### Improvements
- **User Management**: Reworked to enhance performance and usability
- **PerunNavbar**: Redesigned for improved performance, usability, and a more modern look

### Clean-up
- Removed unused components and deprecated functions to optimize the codebase
