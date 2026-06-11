import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { ConfigurationRoutingModule } from './configuration-routing.module';
import { ConfigurationComponent } from './configuration.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MapsModule } from '../maps/maps.module';

@NgModule({
  imports: [
    SharedModule,
    ConfigurationRoutingModule,
    MapsModule,
    MatTabsModule
  ],
  declarations: [ConfigurationComponent]
})
export class ConfigurationModule { }
