import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { DrawMaskImageComponent } from './draw-mask-image.component';

const routes: Routes = [
  { path: '', component: DrawMaskImageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DrawMaskImageRoutingModule { }
