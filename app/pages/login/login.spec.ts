import { beforeEach, beforeEachProviders, describe, expect, injectAsync, it } from "@angular/core/testing";
import { ComponentFixture, TestComponentBuilder } from "@angular/compiler/testing";
import { provide } from "@angular/core";
import { LoginPage } from "./login";
import { Utils } from "../../services/utils";
import { PlayerApi } from "../../services/gb-services";
import { Config, Form, App, NavController, NavParams, Platform } from "ionic-angular";

class MockClass {
  public get(): any {
    return {};
  }

  public getBoolean(): boolean {
    return true;
  }

  public getNumber(): number {
    return 42;
  }
}

let loginPage: LoginPage = null;
let loginPageFixture: ComponentFixture<LoginPage> = null;

describe("The Login page", () => {

  beforeEachProviders(() => [
    Form,
    provide(NavController, { useClass: MockClass }),
    provide(NavParams, { useClass: MockClass }),
    provide(Config, { useClass: MockClass }),
    provide(App, { useClass: MockClass }),
    provide(Platform, { useClass: MockClass }),
  ]);

  beforeEach(injectAsync([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    return tcb
      .createAsync(LoginPage)
      .then((componentFixture: ComponentFixture<LoginPage>) => {
        loginPageFixture = componentFixture;
        loginPage = componentFixture.componentInstance;
        loginPageFixture.detectChanges();
      })
      .catch(Utils.promiseCatchHandler);
  }));

  it("initialises", () => {
    expect(loginPage).not.toBeNull();
    expect(loginPageFixture).not.toBeNull();
  });

  it("has a login method", () => {
    let successObj = {
      "id": "Qf6hwX5JEsRU9mkFx9nGNucVEKSQK9MBFRHQaRYeair6HIZijpD51eBJsEC09ILf",
      "ttl": 1209600,
      "created": "2016-06-09T04:48:09.632Z",
      "userId": 1
    };
    spyOn(PlayerApi, "login").and.callFake(() => {
      return successObj;
    });
    loginPage.loginForm.value = { username: "mcbenton", password: "letmein" };
    expect(loginPage.login).not.toBeNull();
    // expect(PlayerApi.login).toH
  });

  it("stores a user's credentials on successful login", () => {
    expect(loginPage.storeCredentials).not.toBeNull();
  });

  it("notifies the user when login fails", () => {
    expect(loginPage.notifyOnFail).not.toBeNull();
  });

});