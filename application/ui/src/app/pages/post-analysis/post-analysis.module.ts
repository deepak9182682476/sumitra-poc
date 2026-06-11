import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { PostAnalysisRoutingModule } from './post-analysis-routing.module';
import { PostAnalysisComponent } from './post-analysis.component';
import { GraphComponent } from './graph/graph.component';
import { VideoComponent } from './videos/video.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatTabsModule } from '@angular/material/tabs';
import {MatMenuModule} from '@angular/material/menu';

// import { PostAnalysisMapComponent } from './map/post-analysis-map.component';
import { MapsModule } from '../maps/maps.module';

@NgModule({
  imports: [
    SharedModule,
    PostAnalysisRoutingModule,
    HighchartsChartModule,
    MatTabsModule,
    MatMenuModule,
    MapsModule
  ],
  declarations: [
    PostAnalysisComponent,
    GraphComponent,
    VideoComponent,
    // PostAnalysisMapComponent
  ],
  exports: [
    HighchartsChartModule,
    MapsModule
  ]
})

export class PostAnalysisModule { }
