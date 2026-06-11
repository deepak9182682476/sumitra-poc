import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common.service';
import { ThemeService } from '../../theme/theme.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  activeTheme: any = {};

  constructor(
    public commonService: CommonService,
    public themeService: ThemeService) { }

  ngOnInit(): void {
    if (!this.commonService.getLocalStorage('userInfo')) {
      if (typeof this.themeService.getActiveTheme == 'function') {
        this.activeTheme = this.themeService.getActiveTheme();
      }
    }
    else {
      const getSignedInData = this.commonService.getDecryptedUserData();
      const userInfo = (getSignedInData) ? JSON.parse(getSignedInData) : false;
      this.activeTheme.name = (userInfo) ? userInfo.theme : 'dark';
    }

    this.commonService.watchStorage().subscribe((data: string) => {
      // this will call whenever your localStorage data changes
      if (!this.commonService.getLocalStorage('userInfo')) {
          this.activeTheme.name = 'dark';
      } else {
        this.activeTheme = this.themeService.getActiveTheme();
      }
    });
  }

}
