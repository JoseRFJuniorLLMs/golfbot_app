import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {FormBuilder, Validators, ControlGroup} from "@angular/common";
import {HTTP_PROVIDERS} from "@angular/http";
import {PlayerApi} from "../../services/gb-services";

@Component({
  templateUrl: "build/pages/login/login.html",
  providers: [HTTP_PROVIDERS, PlayerApi]
})
export class LoginPage {

  loginForm: ControlGroup;

  constructor(public nav: NavController, private playerApi: PlayerApi, fb: FormBuilder) {
    this.loginForm = fb.group({
      "username": ["", Validators.required],
      "password": ["", Validators.required]
    });
  }

  login(event): void {
    event.preventDefault();
    this.playerApi.login(this.loginForm.value)
      .subscribe(this.storeCredentials, this.notifyOnFail);
  }

  storeCredentials(user: any) {
    console.log(user);
  }

  notifyOnFail(err: any) {
    console.log(err);
  }

  get value(): string { return this.loginForm.value; }
}
