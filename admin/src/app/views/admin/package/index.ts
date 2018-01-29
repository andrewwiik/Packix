import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { PackageViewComponent } from "./package-view.component";
import {RemarkDirectivesModule} from "../../../helpers/directives/index";
import {RouterModule} from "@angular/router";
import { QuillModule } from 'ngx-quill';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {PackageVersionViewModule} from "./version/index";
import { FileUploadModule } from 'ng2-file-upload/ng2-file-upload';

@NgModule({
    declarations: [PackageViewComponent],
    imports     : [BrowserModule, RemarkDirectivesModule, RouterModule, FileUploadModule, QuillModule, FormsModule, PackageVersionViewModule],
    exports     : [PackageViewComponent]
})

export class PackageViewModule {}
