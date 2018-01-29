import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PassportComponent} from "./passport/passport.component";
import {BlankLayoutComponent} from "./components/common/layouts/blankLayout.component";
import {DashboardLayoutComponent} from "./components/common/layouts/dashboardLayout.component";
import {LoginViewComponent} from "./views/login/login.component";
import {PackagesViewComponent} from "./views/admin/packages/packages-view.component";
import {PackageViewComponent} from "./views/admin/package/package-view.component";
import {PackageVersionViewComponent} from "./views/admin/package/version/package-version-view.component";
const routes: Routes = [

  {
    path: '', component: DashboardLayoutComponent,
    children: [
      { path: 'packages', component: PackagesViewComponent },
      { path: 'packages/:id', component: PackageViewComponent },
      { path: 'packages/:id/version/:version', component: PackageVersionViewComponent },
    ]
  },
  {
    path: '', component: BlankLayoutComponent,
    children: [
      { path: 'login', component: LoginViewComponent },
      { path: 'passport/:id/:userId', component: PassportComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
