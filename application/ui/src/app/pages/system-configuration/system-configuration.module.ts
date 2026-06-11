import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemConfigurationComponent } from './system-configuration.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SystemConfigurationRoutingModule } from './system-configuration-routing.module'
import { MapsModule } from '../maps/maps.module';


@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    SystemConfigurationRoutingModule,
    MapsModule
  ],
  declarations: [
    SystemConfigurationComponent
  ]
})
export class SystemConfigurationModule { }
