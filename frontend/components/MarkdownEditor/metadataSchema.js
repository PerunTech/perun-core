/**
 * Schema for the guide metadata form.
 *
 * `route`, `title` and `order` are written into the document's front matter on save; `locale` and
 * `slug` form the filename. They share one form because an author does not care which half of the
 * stored file a field ends up in.
 */
export default function getMetadataSchema(context, { locales = [], routes = [] } = {}) {
  const fmt = (id) => context.intl.formatMessage({ id, defaultMessage: id });

  // oneOf renders a select. An empty oneOf is an invalid schema, so each falls back to a plain
  // string field when its option list is empty.
  const locale = locales.length
    ? { type: 'string', title: fmt('perun.help_editor.locale'), oneOf: locales.map(item => ({ const: item.value, title: item.label })) }
    : { type: 'string', title: fmt('perun.help_editor.locale') };

  // A dropdown, so a guide can only point at a route that exists. The list carries the registered
  // modules plus every route already used by a saved guide, so opening an older document does not
  // find its own route missing from the options.
  //
  // The default is load-bearing rather than a convenience: RJSF's SelectWidget only renders its
  // empty placeholder option while `schema.default` is undefined, so declaring one is what removes
  // the "pick a route" entry. Every option is a valid answer here and the field is required, so an
  // empty first entry only offered a way to fail validation.
  const route = routes.length
    ? {
      type: 'string',
      title: fmt('perun.help_editor.route'),
      default: routes[0].value,
      oneOf: routes.map(item => ({ const: item.value, title: item.label })),
    }
    : { type: 'string', title: fmt('perun.help_editor.route'), pattern: '^/' };

  return {
    schema: {
      type: 'object',
      required: ['route', 'locale', 'slug'],
      properties: {
        route,
        title: { type: 'string', title: fmt('perun.help_editor.title') },
        locale,
        slug: {
          type: 'string',
          title: fmt('perun.help_editor.slug'),
          pattern: '^[a-z0-9][a-z0-9-_]*$',
        },
        order: { type: 'integer', title: fmt('perun.help_editor.order') },
      },
    },
    uiSchema: {
      'ui:order': ['route', 'title', 'locale', 'slug', 'order'],
      route: { 'ui:classNames': 'md-f md-f--grow' },
      title: { 'ui:classNames': 'md-f md-f--grow' },
      locale: { 'ui:classNames': 'md-f md-f--narrow' },
      slug: { 'ui:classNames': 'md-f' },
      order: { 'ui:classNames': 'md-f md-f--narrow' },
    },
  };
}

/**
 * ajv reports pattern and required failures in its own wording. These are the same messages the
 * hand-rolled checks used, so an author sees why a field is wrong rather than the raw rule.
 */
export const transformMetadataErrors = (errors, context) => {
  const fmt = (id) => context.intl.formatMessage({ id, defaultMessage: id });

  return errors.map(error => {
    const field = error.property?.replace(/^\./, '');
    if (field === 'route') return { ...error, message: fmt('perun.help_editor.error_route') };
    if (field === 'slug') return { ...error, message: fmt('perun.help_editor.error_slug') };
    if (field === 'locale') return { ...error, message: fmt('perun.help_editor.error_locale') };
    if (field === 'order') return { ...error, message: fmt('perun.help_editor.error_order') };
    return error;
  });
};
