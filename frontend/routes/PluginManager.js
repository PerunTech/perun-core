import { router } from './Router';

/**
 * The set of registered plugins for the current session.
 * Should register necessary scripts only, according to the priviliges of the accessing entity.
 * @private
 * @type {Object}
 */
const _plugins = {};

/**
 * Remote script utilities.
 * 
 * @namespace pluginManager
 */
export const pluginManager = {
  /**
   * Retrieves the whole plugin registry. 
   * The caller can decide what to do with it.
   * 
   * &nbsp;
   * 
   * @function getRegistry (getRegistry): any
   * 
   * @returns The map of registered plugins.
   */
  getRegistry() {
    return _plugins;
  },

  /**
   * Retrives a plugin from the registry with the given `name`.
   * 
   * &nbsp;
   * 
   * @function getPlugin (name: string): any || Error
   * 
   * @param {string} name - The name of the plugin. 
   * 
   * @returns any || Error;
   */
  getPlugin(name) {
    return _plugins[name]
      || Reflect.construct(Error, [`Plugin with reference key: ${name} has not been found.`]);
  },

  /**
   * Registers a `plugin` in the registry with the given `name`.
   * Will overwrite the register under `name`, `use with caution`.
   * 
   * &nbsp;
   * 
   * @function registerPlugin (name:string, plugin: any): plugin || Error
   * 
   * @param {string} name - The name of the plugin.
   * @param {*} plugin - The plugin entity.
   * 
   * @returns plugin || Error;
   */
  registerPlugin(name, plugin) {
    const register = () => {
      plugin.routes && [...plugin.routes].map(route => router.registerRoute(route.name, route));
      plugin.id = name;
      _plugins[name] = plugin;

      return plugin;
    };

    return (name && plugin)
      ? register()
      : Reflect.construct(Error, ['Plugin failed to register. Invalid arguments provided.']);
  },

  /**
   * Loads and executes a plugin (as script) in the current browser environment.
   * 
   * Responsibility deferred to caller to provide full path and name,
   * omitted any path resolution for an url, given a name string reference.
   * 
   * 
   * No solution provided for webpack-specific bundles, loader is old school, executes scripts from url.
   * `The plugin should register itself in the global context on script execution, i.e the entry point
   * of the plugin should assemble all exposable modules such that plugin = {...modules}
   * and do window[name] = plugin`.
   * 
   * The loader will simply look on the global context for the given `name` in the arguments.
   * If the plugin is already registered, the script will not be executed again.
   * 
   * &nbsp
   * 
   * @function loadPlugin (name: string, url: string): Promise <any>
   * 
   * @param {string} name - Name of the plugin.
   * @param {string} url - URL path of the script.
   * 
   * @returns Promise <any>; 
   */
  loadPlugin(name, url) {
    return !(_plugins[name]) && new Promise((resolve, reject) => {
      // Create a script element.
      const script = Object.assign(document.createElement('script'), { id: name, type: 'text/javascript' });

      script.onload = () => // revise compatibility(IE) and window[name] gimmick.
        resolve({ id: name, value: this.registerPlugin(name, (window[name][name] || window[name])) });
      script.onerror = () => // Do better messages.
        reject({ id: name, value: Reflect.construct(Error, ['Script failed to load for plugin ' + name]) });

      script.src = url; // images load on this line. Browser implementaion specific.
      document.body.appendChild(script); // JS scripts load on this line.
    });
  },
};
