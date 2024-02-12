# Perun Core

The front-end module of the Svarog framework, containing the core functionalities such as login, admin console, plugin management and provides the React framework to other modules.

### Installation

  Run `npm install` to get the project's dependencies.

  Run `npm run build` to produce minified version of your library.

### Running a local development server

Having all the dependencies installed run `npm run dev`. This command will generate an non-minified version of your library and will run a watcher so you get the compilation on file change.

### Scripts

- `npm run build` - Produces a production version of your library under the `/www` folder 
- `npm run dev` - Produces a development version of your library and runs a watcher 
- `npm run test` - Analyzes the code using `eslint` and the configuration defined in the `.eslintrc` file