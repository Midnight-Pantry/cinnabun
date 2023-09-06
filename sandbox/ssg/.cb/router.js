
import * as Cinnabun from "cinnabun";
import { RouterComponent, RouteComponent } from "cinnabun/dist/router/router.js";
import Index from "../dist/pages/Index.js";
import About from "../dist/pages/About.js";
import SomePage from "../dist/pages/SomePath/SomePage.js";

export default function StaticRouter() {
  return new RouterComponent(RouterComponent.pathStore, [
    new RouteComponent("/Index", Index),
    new RouteComponent("/About", About),
    new RouteComponent("/SomePage", SomePage)
  ])
}
