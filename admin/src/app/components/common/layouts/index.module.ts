import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {RouterModule} from "@angular/router";

import {DashboardLayoutComponent} from "./dashboardLayout.component";
import {BlankLayoutComponent} from "./blankLayout.component";

import {RemarkDirectivesModule} from "../../../helpers/directives/index";
import {PipesModule} from "../../../pipes/index";
import {NavigationModule} from "../navigation/index";
import {FooterModule} from "../footer/index";


@NgModule({
  declarations: [
    DashboardLayoutComponent,
    BlankLayoutComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    PipesModule,
    RemarkDirectivesModule,
    NavigationModule,
    FooterModule
  ],
  exports: [
    DashboardLayoutComponent,
    BlankLayoutComponent
  ]
})

export class LayoutsModule {}
