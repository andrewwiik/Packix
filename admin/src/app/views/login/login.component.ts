import {AfterViewInit, Component, OnDestroy} from '@angular/core';

declare var jQuery:any;

@Component({
  selector: 'login',
  templateUrl: 'login.template.html'
})
export class LoginViewComponent implements AfterViewInit, OnDestroy {
  ngAfterViewInit() {
    jQuery('body').addClass('page-login-v3');
    jQuery('body').addClass('layout-full');
  }

  ngOnDestroy() {
    jQuery('body').removeClass('page-login-v3');
    jQuery('body').removeClass('layout-full');
  }
}
