import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";

import { CommonService } from "./services/common.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  showHeader = false;
  showSubHeader = false;
  showSidebar = false;
  showTimeline = false;
  showFooter = false;
  diagnosticsSideBar = false;

  constructor(
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public commonService: CommonService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showHeader =
          this.activatedRoute.firstChild.snapshot.data.showHeader !== false;
        this.showSubHeader =
          this.activatedRoute.firstChild.snapshot.data.showSubHeader !== false;
        this.diagnosticsSideBar =
          this.activatedRoute.firstChild.snapshot.data.diagnosticsSideBar !==
          false;
        this.showSidebar =
          this.activatedRoute.firstChild.snapshot.data.showSidebar !== false;
        this.showTimeline =
          this.activatedRoute.firstChild.snapshot.data.showTimeline !== false;
        this.showFooter =
          this.activatedRoute.firstChild.snapshot.data.showFooter !== false;
      }
    });
  }

  ngOnInit(): void {}
}
