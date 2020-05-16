import 'regenerator-runtime/runtime';
import 'whatwg-fetch';

import * as environment from '../config/environment.json';
import { initialState } from './state';

import { PLATFORM } from 'aurelia-pal';

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'))
    .plugin(PLATFORM.moduleName('aurelia-materialize-bridge'), b => b.useAll())
    .plugin(PLATFORM.moduleName('aurelia-store'), { initialState });

  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn')

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
