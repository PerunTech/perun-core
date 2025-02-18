/**
 * Preserve the order of these, routing with a Switch component exits on the first match,
 * like a regular switch case, thus order matters. 
 * 
 * Replicate the order in route generation in Router.js and render body of Routes.js
 * 
 * `Home` should always be on top, as the login page auto redirects there,
 * then follows `Main` and after that is `SubModule`, the latter being a generic box for
 * sub-menus and plugins. 
 * 
 * Always last is NotFound, this is the default fallback. We need to give our <Switch />
 * the opportunity to cycle over all registered routes before exiting with a 404 in NotFound.
 * 
 * Given the above all we need to preserve is Home and Main on top and Not Found at end,
 * everything in the middle of the routes object is a flat map of the various plugins / sub-menus. 
 */
export { Home } from './local/Home';
export { Main } from './local/Main';
export { AdminConsoleRoute } from './local/AdminConsole';
export { UserGuideRoute } from './local/UserGuideRoute';
export { MyProfileRoute } from './local/MyProfile';
// KEEP ON THE BOTTOM
export { NotFoundRoute } from './local/404'
