import { ADDITIONAL_TEST_BROWSER_PROVIDERS, TEST_BROWSER_STATIC_PLATFORM_PROVIDERS } from '@angular/platform-browser/testing/browser_static';
import { BROWSER_APP_DYNAMIC_PROVIDERS }                from '@angular/platform-browser-dynamic';
import { resetBaseTestProviders, setBaseTestProviders } from '@angular/core/testing';
import { GolfBotApp } from './app';

// this needs doing _once_ for the entire test suite, hence it's here
resetBaseTestProviders();
setBaseTestProviders(
  TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
  [
    BROWSER_APP_DYNAMIC_PROVIDERS,
    ADDITIONAL_TEST_BROWSER_PROVIDERS,
  ]
);


// Mock out Ionic's platform class
class MockClass {
  public ready(): any {
    return new Promise((resolve: Function) => {
      resolve();
    });
  }
}

let gba: GolfBotApp = null;

describe('The GolfBot app', () => {

  beforeEach(function() {
    let platform = (<any>new MockClass());
    gba = new GolfBotApp(platform);
  });

  it('initialises with two possible pages', () => {
    expect(gba).not.toBeNull();
  });
});