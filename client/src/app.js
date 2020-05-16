import { PLATFORM } from "aurelia-framework";

import materialize from 'materialize-css';

export class App {
  configureRouter(config, router) {
    this.router = router;
    config.title = "Quiggler";
    config.map([
      {
        route: "home/",
        name: "home",
        moduleId: PLATFORM.moduleName("./resources/elements/home/home")
      },
      {
        route: "quilts/:slug/edit/",
        name: "quilt-editor",
        moduleId: PLATFORM.moduleName("./resources/elements/quilt-editor/quilt-editor")
      },
    ]);
  }
}
