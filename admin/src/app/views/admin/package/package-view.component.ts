import {AfterViewInit, Component, OnDestroy, ElementRef, ViewChild, ViewEncapsulation} from '@angular/core';
import { FileUploader } from 'ng2-file-upload/ng2-file-upload';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import {PackageApi} from "../../../shared/sdk/services/custom/Package";
import {LoopBackAuth} from "../../../shared/sdk/services/core/auth.service";
import {LoopBackConfig} from "../../../shared/sdk/lb.config";
import {Package} from "../../../shared/sdk/models/Package";
import {PackageFile} from "../../../shared/sdk/models/PackageFile";
import {RemarkPlugin} from "../../../helpers/remark-plugin";
import {ScrollablePlugin} from "../../../helpers/plugins/scrollable";
import {ActivatedRoute} from "@angular/router";
import {QuillEditorComponent} from "ngx-quill";
import {PackageScreenshotApi} from "../../../shared/sdk/services/custom/PackageScreenshot";
import {PackageScreenshot} from "../../../shared/sdk/models/PackageScreenshot";

@Component({
    selector: 'package-view',
    templateUrl: 'package-view.template.html'
})

export class PackageViewComponent implements AfterViewInit, OnDestroy{

  public package: Package;
  public packageID: string;
  public detailedPackageDescription: any;
  public screenshotUploader: FileUploader;

  @ViewChild('editor') editor: QuillEditorComponent;

  constructor(
    private packageAPI: PackageApi,
    private auth: LoopBackAuth,
    private route: ActivatedRoute,
    private screenshotAPI: PackageScreenshotApi
  ) {

    this.screenshotUploader = new FileUploader({
      autoUpload: true,
      authToken: this.auth.getAccessTokenId(),
      url: LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() + "/Packages/screenshots/upload",
      isHTML5: true
    });

    this.screenshotUploader.onCompleteItem = this.screenshotUploadComplete;
    this.screenshotUploader['delegate'] = this;

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.packageID = params['id'];
        this.screenshotUploader.setOptions({
          url: LoopBackConfig.getPath() + "/" + LoopBackConfig.getApiVersion() + "/Packages/" + this.packageID + "/screenshots/upload"
        });
        this.loadPackageData();
      }
    });

    RemarkPlugin.register('scrollable', ScrollablePlugin);
  }

  loadPackageData() {
    this.packageAPI.findById(this.packageID,{
      include: [
        {versions: 'file'},
        'latestVersion',
        'downloadRestrictions'
      ]
    })
      .subscribe((packageObject : Package) => {
        this.package = packageObject;
        this.detailedPackageDescription = this.package.detailedDescription;
        if (this.editor) {
          this.editor.writeValue(this.package.detailedDescription);
          console.log(this.editor);
        }
        console.log(this.package);
      });
  }

  ngAfterViewInit() {
    // jQuery('body').addClass('page-aside-left');
    // jQuery('body').addClass('page-aside-scroll');
    jQuery('body').addClass('app-packages');
  }

  screenshotUploadComplete(item:any, response:any, status:number, headers:any) {
    let packageData: Package = new Package(JSON.parse(response));

    console.log(packageData);
    console.log(this);
    console.log(item);

    let queue: Array<any> = item.uploader.queue;
    queue.splice( queue.indexOf(item), 1 );

    this['delegate'].package['screenshots'] = packageData.screenshots;
  }

  removeScreenshot(screenshot: any) {
    console.log(screenshot.id);
    console.log(this.screenshotAPI);
    this.screenshotAPI.deleteById(screenshot.id)
      .subscribe((thing: any) => {
        console.log(thing);
      });
    this.package['screenshots'].splice(  this.package['screenshots'].indexOf(screenshot), 1 );
  }


  savePackageDescription() {
    if (this.package) {
      this.package.detailedDescription = this.detailedPackageDescription;
      this.packageAPI.patchAttributes(this.package.id,{
        "detailedDescription": this.detailedPackageDescription
      })
        .subscribe((packageChanges : any) => {
          console.log(packageChanges);
        });
    }
  }

    ngOnDestroy() {
      jQuery('body').removeClass('app-packages');
      // jQuery('body').removeClass('page-aside-scroll');
      // jQuery('body').removeClass('page-aside-left');
    }
}
