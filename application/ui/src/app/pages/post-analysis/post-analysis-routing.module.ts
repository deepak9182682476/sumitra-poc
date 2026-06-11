import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions } from '@angular/router';
import { PostAnalysisComponent } from './post-analysis.component';

const routes: Routes = [
  { path: '', component: PostAnalysisComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class PostAnalysisRoutingModule { }
