import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { PackageVersionViewComponent } from "./package-version-view.component";
import {RemarkDirectivesModule} from "../../../../helpers/directives/index";
import {RouterModule} from "@angular/router";
// import { QuillModule } from 'ngx-quill';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {SortablejsModule} from "angular-sortablejs";

@NgModule({
    declarations: [PackageVersionViewComponent],
    imports     : [BrowserModule, RemarkDirectivesModule, RouterModule, FormsModule, SortablejsModule],
    exports     : [PackageVersionViewComponent]
})

export class PackageVersionViewModule {}
