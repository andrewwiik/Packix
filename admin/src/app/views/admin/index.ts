import {NgModule} from "@angular/core";
import { FormsModule }   from '@angular/forms';
import {BrowserModule} from "@angular/platform-browser";
import {RouterModule} from "@angular/router";
import {PackagesViewModule} from "./packages/index";
import {PackageViewModule} from "./package/index";

@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    RouterModule,
    FormsModule,
    PackagesViewModule,
    PackageViewModule
  ],
  exports: [
  ],
})

export class AdminDashboardViewsModule {
}
