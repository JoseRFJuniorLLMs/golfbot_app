import {Page, NavController} from 'ionic-angular';
import {FormBuilder,Validators} from '@angular/common';
import {HTTP_PROVIDERS} from '@angular/http';
import {PlayerApi} from '../../services/gb-services';

@Page({
  templateUrl: 'build/pages/login/login.html',
  providers: [HTTP_PROVIDERS, PlayerApi]
})
export class LoginPage {

  private loginForm;

  constructor(public nav: NavController, private playerApi: PlayerApi, fb: FormBuilder) {
    this.loginForm = fb.group({
      "username": ["", Validators.required],
      "password": ["", Validators.required]
    });
  }

  login(event) {
    event.preventDefault();
    this.playerApi.login(this.loginForm.value).toPromise()
      .then(res => {
        // what happens when it works!
        // store creds and/or auth token locally
        // whenever app is opened, check for creds/token
        // and take them directly in
      })
      .catch(err => {
        // what happens when it fails
        console.log(err);
      });
  }
}
