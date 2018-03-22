export const DEFAULT_ROUTING_ROOT_PATH = '/';

export const KOA_PLUGIN_CONFIG = Symbol('GABLIAM/KOA_PLUGIN_CONFIG');

export const APP = Symbol('GABLIAM/KOA_APP');

/**
 * Represent a custom router creator
 *
 * If you want a custom router use this const for create your router
 *
 * ## Sample
 * @Config()
 * class Conf {
 *  @Bean(CUSTOM_ROUTER_CREATOR)
 *  custom() {
 *    return () =>
 *      e.Router({
 *        caseSensitive: true
 *      });
 *  }
 * }
 */
export const CUSTOM_ROUTER_CREATOR = Symbol(
  'GABLIAM/CUSTOM_KOA_ROUTER_CREATOR'
);

export const SERVER = Symbol('GABLIAM/KOA_SERVER');

export const ERRORS_MSGS = {
  DUPLICATED_CONFIG_DECORATOR: `Cannot apply @KoaConfig decorator multiple times on same method.`
};
