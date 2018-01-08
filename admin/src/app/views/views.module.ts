import {NgModule} from "@angular/core";
import { FormsModule }   from '@angular/forms';
import {BrowserModule} from "@angular/platform-browser";
import {RouterModule} from "@angular/router";
import {LoginViewComponent} from "./login/login.component";
import {AdminDashboardViewsModule} from "./admin/index";


@NgModule({
  declarations: [
    LoginViewComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    FormsModule,
    AdminDashboardViewsModule
  ],
  exports: [
    LoginViewComponent
  ],
})

export class AppViewsModule {
}
