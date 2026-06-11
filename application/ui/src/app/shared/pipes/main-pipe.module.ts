import { NgModule } from '@angular/core';
import {CommonModule} from "@angular/common";

import {SearchPipe} from "./search-filter"; 
import {DataFilterPipe} from "./data-filter"; 

@NgModule({
  declarations:[SearchPipe, DataFilterPipe], 
  imports:[CommonModule],
  exports:[SearchPipe, DataFilterPipe] 
})

export class MainPipe {}