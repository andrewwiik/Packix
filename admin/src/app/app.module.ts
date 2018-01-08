import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import { SDKBrowserModule } from "./shared/sdk/index";
import { PassportModule } from './passport/index';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PipesModule } from './pipes/index';
import {AppViewsModule} from "./views/views.module";
import {LayoutsModule} from "./components/common/layouts/index.module";
import {RemarkDirectivesModule} from "./helpers/directives/index";
import {SortablejsModule} from 'angular-sortablejs';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    SDKBrowserModule.forRoot(),
    SortablejsModule.forRoot({}),
    PassportModule,
    AppRoutingModule,
    PipesModule,
    AppViewsModule,
    LayoutsModule,
    RemarkDirectivesModule
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
