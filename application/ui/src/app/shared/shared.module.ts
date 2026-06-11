import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { PopoverModule } from 'ngx-bootstrap/popover';

import { NgScrollbarModule, NG_SCROLLBAR_OPTIONS } from 'ngx-scrollbar';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MainPipe } from "./pipes/main-pipe.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    AccordionModule.forRoot(),
    CarouselModule.forRoot(),
    PopoverModule.forRoot(),
    NgScrollbarModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDividerModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MainPipe
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CollapseModule,
    BsDropdownModule,
    TabsModule,
    ModalModule,
    AccordionModule,
    CarouselModule,
    PopoverModule,
    NgScrollbarModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDividerModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MainPipe
  ]
})

export class SharedModule { }
