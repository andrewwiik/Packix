import { Component } from '@angular/core';

import { SDKToken, User, UserIdentity, LoopBackAuth, UserIdentityApi, UserApi} from '../shared/sdk';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {StorageBrowser} from "../shared/sdk/storage/storage.browser";

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'passport',  // <home></home>
  // Our list of styles in our component. We may add more to compose many styles together
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './passport.template.html'
})
export class PassportComponent {

  // subscriptions: Array<Subscription> = [];

  constructor(
    private auth: LoopBackAuth,
    private userIdentityApi: UserIdentityApi,
    private userApi: UserApi,
    private route: ActivatedRoute,
    private router: Router,
    private storageBrowser: StorageBrowser
  ) {
    this.storageBrowser.remove('cached_profile_email');
    this.storageBrowser.remove('cached_profile_photo_url');
    this.storageBrowser.remove('cached_profile_display_name');
    this.route.params.subscribe((token: SDKToken) => {
      console.log(token);
      if (token.id && token.userId) {
        console.log(token);
        this.auth.setToken(token);
       // this.auth.setUser(token);
        this.auth.setRememberMe(true);
        this.auth.save();
          this.userApi.findById(token.userId)
            .subscribe(response => {
              this.auth.getToken().user = <User>response;
              this.userIdentityApi.find({ "where": { "userId": token.userId } }).subscribe((identities: UserIdentity[]) => {
                this.auth.getToken().user["identities"] = identities;
                this.auth.save();
                this.router.navigate(['/']);
              })
        })
      }
    });
  }
}
