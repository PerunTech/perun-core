/**
* Menu configurator. Translates the labels if label context is provided and returns an object of menu items depending on the requested menu type.
* If context is not present for items requiring it, a 'CONTEXT_MISSING' warning is appended in front of the label placeholder.
* @author KNI
* @version 1.1
* @function
*
* MANDATORY PARAMETERS
* @param {string} requestedMenu - Type of menu requested by the component. Mandatory for all types of menus.
*
* OPTIONAL PARAMETERS
* @param {object} context -  The labels object of the application, needed to translate the labels. Only mandatory where translation is actually needed.
*
* RETURNS
* @return {object} - The menu configurator, formats the labels nad returns an object, containing the requested menu items
*/

export function menuConfig (requestedMenu, context) {
  const menuTypes = {
    CORE_MENU: [
      {
        ID: 'btn_logout',
        ...context
          ? { LABEL: context.formatMessage({ id: 'perun.main.nav_bar_logout', defaultMessage: 'perun.main.nav_bar_logout' }),
            FLOATHELPER: context.formatMessage({ id: 'perun.main.help.nav_bar_logout', defaultMessage: 'perun.main.help.nav_bar_logout' }) }
          : { LABEL: 'CONTEXT_MISSING_perun.main.nav_bar_logout',
            FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.nav_bar_logout' },
        FUNCTION: 'logout',
        TYPE: undefined,
        LINK_ACTIVE: false,
        IMAGESRC: 'img/menu_icons/logout-white.svg',
        IMAGESRC2: 'img/menu_icons/logout-yellow.svg'
      }
    ],
    MAIN_MENU: {
      LIST_OF_ITEMS: [
        /* {
          ID: 'btn_farm',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.nav_bar_farm', defaultMessage: 'perun.main.nav_bar_farm' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.help.nav_bar_farm', defaultMessage: 'perun.main.help.nav_bar_farm' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.nav_bar_farm',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.nav_bar_farm'
            },
          FUNCTION: 'grid',
          TYPE: 'PREMISE',
          LINK_ACTIVE: true,
          IMAGESRC: 'img/menu_icons/menu_icon_farm.svg'
        }, */ {
          ID: 'btn_user_profile',
          LABEL: 'User Profile',
          FLOATHELPER: 'Click to view edit user settings',
          FUNCTION: undefined,
          TYPE: undefined,
          LINK_ACTIVE: false,
          LINK_TO: '/main/console',
          IMAGESRC: 'img/menu_icons/user_profile.svg',
          IMAGESRC2: 'img/menu_icons/user_profile-yellow.svg'
        }, {
          ID: 'btn_adm_console',
          LABEL: 'Admin Console',
          FLOATHELPER: 'Click to view edit internal system data',
          FUNCTION: undefined,
          TYPE: undefined,
          LINK_ACTIVE: false,
          LINK_TO: '/main/console',
          IMAGESRC: 'img/menu_icons/settings-white.svg',
          IMAGESRC2: 'img/menu_icons/settings-yellow.svg'
        }, {
          ID: 'btn_help',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.nav_bar_help', defaultMessage: 'perun.main.nav_bar_help' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.help.nav_bar_helper', defaultMessage: 'perun.main.help.nav_bar_helper' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.nav_bar_help',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.nav_bar_helper' },
          FUNCTION: 'help',
          TYPE: undefined,
          LINK_ACTIVE: false,
          IMAGESRC: 'img/menu_icons/help-white.svg',
          IMAGESRC2: 'img/menu_icons/help-yellow.svg'
        }, {
          ID: 'btn_logout',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.nav_bar_logout', defaultMessage: 'perun.main.nav_bar_logout' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.help.nav_bar_logout', defaultMessage: 'perun.main.help.nav_bar_logout' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.nav_bar_logout',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.nav_bar_logout' },
          FUNCTION: 'logout',
          TYPE: undefined,
          LINK_ACTIVE: false,
          IMAGESRC: 'img/menu_icons/logout-white.svg',
          IMAGESRC2: 'img/menu_icons/logout-yellow.svg'
        }
      ]
    },

    SIDE_MENU_HOLDING: {
      LIST_OF_ITEMS: [
        {
          ID: 'list_item_holding',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.holding.general', defaultMessage: 'perun.main.holding.general' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.holding.general', defaultMessage: 'perun.main.holding.general' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.holding.general',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.holding.general' },
          FUNCTION: 'form',
          TYPE: 'HOLDING'
        }, {
          ID: 'list_item_holding_members',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.holding_members', defaultMessage: 'perun.main.holding_members' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.holding_members', defaultMessage: 'perun.main.holding_members' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.holding_members',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.holding.holding_members' },
          FUNCTION: 'grid',
          TYPE: 'HOLDING_MEMBERS'
        }, {
          ID: 'list_item_premises',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.holding.premises', defaultMessage: 'perun.main.holding.premises' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.holding.premises', defaultMessage: 'perun.main.holding.premises' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.holding.premises',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.holding.premises' },
          FUNCTION: 'grid',
          TYPE: 'PREMISE',
          ISCONTAINER: true
        }, {
          ID: 'list_item_livestock',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.livestock.general', defaultMessage: 'perun.main.livestock.general' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.livestock.general', defaultMessage: 'perun.main.livestock.general' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.livestock.general',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.livestock.general' },
          FUNCTION: 'grid',
          TYPE: 'LIVESTOCK',
          ISCONTAINER: true
        }
      ]
    },

    SIDE_MENU_PREMISE: {
      LIST_OF_ITEMS: [
        {
          ID: 'list_item_premise_details',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.premise.general', defaultMessage: 'perun.main.premise.general' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.premise.general', defaultMessage: 'perun.main.premise.general' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.side_bar_farm_details',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.side_bar_farm_details' },
          FUNCTION: 'form',
          TYPE: 'PREMISE'
        }, {
          ID: 'list_item_premise_owner',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.premise.premise_owner', defaultMessage: 'perun.main.premise.premise_owner' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.premise.premise_owner', defaultMessage: 'perun.main.premise.premise_owner' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.side_bar_animals',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.side_bar_animals' },
          FUNCTION: 'form',
          ISSINGLE: true,
          TYPE: 'PREMISE_OWNER'
        }, {
          ID: 'list_item_vaccination_event',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.vaccination_event.general', defaultMessage: 'perun.main.vaccination_event.general' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.vaccination_event.general', defaultMessage: 'perun.main.vaccination_event.general' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.vaccination_event.general',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.vaccination_event.general' },
          FUNCTION: 'grid',
          TYPE: 'VACCINATION_EVENT',
          ISCONTAINER: true
        }, {
          ID: 'list_item_livestock',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.livestock.general', defaultMessage: 'perun.main.livestock.general' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.livestock.general', defaultMessage: 'perun.main.livestock.general' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.livestock.general',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.livestock.general' },
          FUNCTION: 'grid',
          LINKNAME: 'TEST_LINK',
          TYPE: 'LIVESTOCK',
          ISCONTAINER: true
        }
      ]
    },

    SIDE_MENU_LIVESTOCK: {
      LIST_OF_ITEMS: [
        {
          ID: 'list_item_livestock',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.livestock.general', defaultMessage: 'perun.main.livestock.general' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.livestock.general', defaultMessage: 'perun.main.livestock.general' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.livestock.general',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.livestock.general' },
          FUNCTION: 'form',
          TYPE: 'LIVESTOCK'
        }, {
          ID: 'list_item_vaccination_book',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.livestock.vaccination_book', defaultMessage: 'perun.main.livestock.vaccination_book' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.livestock.vaccination_book', defaultMessage: 'perun.main.livestock.vaccination_book' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.livestock.vaccination_book',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.livestock.vaccination_book' },
          FUNCTION: 'grid',
          TYPE: 'VACCINATION_BOOK'
        }
      ]
    },

    SIDE_MENU_VACCINATION_EVENT: {
      LIST_OF_ITEMS: [
        {
          ID: 'list_item_vaccination_event',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.vaccination_event.general', defaultMessage: 'perun.main.vaccination_event.general' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.vaccination_event.general', defaultMessage: 'perun.main.vaccination_event.general' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.vaccination_event.general',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.vaccination_event.general' },
          FUNCTION: 'form',
          TYPE: 'VACCINATION_EVENT'
        }, {
          ID: 'list_item_vaccination_results',
          ...context
            ? { LABEL: context.formatMessage({ id: 'perun.main.vaccination_event.vaccination_results', defaultMessage: 'perun.main.vaccination_event.vaccination_results' }),
              FLOATHELPER: context.formatMessage({ id: 'perun.main.vaccination_event.vaccination_results', defaultMessage: 'perun.main.vaccination_event.vaccination_results' }) }
            : { LABEL: 'CONTEXT_MISSING_perun.main.vaccination_event.vaccination_results',
              FLOATHELPER: 'CONTEXT_MISSING_perun.main.help.vaccination_event.vaccination_results' },
          FUNCTION: 'grid',
          TYPE: 'VACCINATION_RESULTS'
        }
      ]
    },

    MAIN_PALETTE: {
      LIST_OF_ITEMS: [
        {
          ID: 'HOLDING',
          LABEL: 'Holdings',
          FLOATHELPER: '',
          ROUTE: 'holding'
        },
        {
          ID: 'PREMISE',
          LABEL: 'Premises',
          FLOATHELPER: '',
          ROUTE: 'premise'
        },
        {
          ID: 'REGION',
          LABEL: 'Regions',
          FLOATHELPER: '',
          ROUTE: 'region'
        },
        {
          ID: 'LIVESTOCK',
          LABEL: 'Livestock',
          FLOATHELPER: '',
          ROUTE: 'livestock'
        },
        {
          ID: 'VACCINATION_EVENT',
          LABEL: 'Vaccination',
          FLOATHELPER: '',
          ROUTE: 'vaccination_event'
        }
      ]
    }
  }
  return menuTypes[requestedMenu]
}
