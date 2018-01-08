import {AfterViewInit, Component} from '@angular/core';
import {RemarkPlugin} from "../../../helpers/remark-plugin";
import {ScrollablePlugin} from "../../../helpers/plugins/scrollable";

declare var jQuery:any;

@Component({
  selector: 'basic',
  templateUrl: 'dashboardLayout.template.html'
})
export class DashboardLayoutComponent implements AfterViewInit {

  // public ngOnInit():any {
  //   detectBody();
  // }
  //
  // public onResize(){
  //   detectBody();
  // }

  constructor() {
    RemarkPlugin.register('scrollable', ScrollablePlugin);
  }

  ngAfterViewInit() {
    //RemarkPlugin.register('scrollable', ScrollablePlugin);
  }

}
