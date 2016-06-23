import { Component, ViewChild } from "@angular/core";
import { ionicBootstrap, Platform, Nav, Loading } from "ionic-angular";
import { StatusBar } from "ionic-native";
import { ArrayFilterPipe } from "./pipes/array-filter.pipe";
import { GettingStartedPage } from "./pages/getting-started/getting-started";
import { LoginPage } from "./pages/login/login";
import { TeamsPage } from "./pages/teams/teams";
import { CoursesPage } from "./pages/courses/courses";
import { PlayersPage } from "./pages/players/players";

@Component({
  templateUrl: "build/app.html",
  pipes: [ArrayFilterPipe]
})
export class GolfBotApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = GettingStartedPage;
  pages: Array<{ title: string, component: any }>;

  constructor(private platform: Platform) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: "Getting Started", component: GettingStartedPage },
      { title: "Courses", component: CoursesPage },
      { title: "Teams", component: TeamsPage },
      { title: "Players", component: PlayersPage },
      { title: "Login", component: LoginPage},
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn"t want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}

// Pass the main app component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument:
// http://ionicframework.com/docs/v2/api/config/Config/

ionicBootstrap(GolfBotApp);