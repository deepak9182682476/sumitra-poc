import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { MapsComponent } from './maps.component';
import { MapsRoutingModule } from './maps-routing.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ManualRouteMapComponent } from '../manual-route-map/manual-route-map.component';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    SharedModule,
    MapsRoutingModule,
    DragDropModule,
    // NgbModule
  ],
  declarations: [
    MapsComponent,
    ManualRouteMapComponent
  ],
  exports: [
    MapsComponent,
    ManualRouteMapComponent
  ]
})

export class MapsModule { }
