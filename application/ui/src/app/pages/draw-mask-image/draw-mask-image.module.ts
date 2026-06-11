import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

import { DrawMaskImageRoutingModule } from './draw-mask-image-routing.module';
import { DrawMaskImageComponent } from './draw-mask-image.component';

@NgModule({
  imports: [
    SharedModule,
    DrawMaskImageRoutingModule
  ],
  declarations: [DrawMaskImageComponent]
})
export class DrawMaskImageModule { }
