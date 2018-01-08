import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { PackageViewComponent } from "./package-view.component";
import {RemarkDirectivesModule} from "../../../helpers/directives/index";
import {RouterModule} from "@angular/router";
import { QuillModule } from 'ngx-quill';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {PackageVersionViewModule} from "./version/index";

@NgModule({
    declarations: [PackageViewComponent],
    imports     : [BrowserModule, RemarkDirectivesModule, RouterModule, QuillModule, FormsModule, PackageVersionViewModule],
    exports     : [PackageViewComponent]
})

export class PackageViewModule {}
