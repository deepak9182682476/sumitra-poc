import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MaintenanceUserSidebarComponent } from './maintenance-user-sidebar/maintenance-user-sidebar.component';
import { SubHeaderComponent } from './sub-header/sub-header.component';
import { TimelineComponent } from './timeline/timeline.component';
import { FooterComponent } from './footer/footer.component';
import { GeAlarmEventTypePipe } from '../shared/pipes/get-event-type';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    NgbModule
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    SubHeaderComponent,
    TimelineComponent,
    FooterComponent,
    MaintenanceUserSidebarComponent
  ],
  declarations: [
    HeaderComponent,
    SidebarComponent,
    SubHeaderComponent,
    TimelineComponent,
    FooterComponent,
    GeAlarmEventTypePipe,
    MaintenanceUserSidebarComponent
  ]
})

export class LayoutModule { }
