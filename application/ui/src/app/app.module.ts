import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { LayoutModule } from './layout/layout.module';
import { AppRoutingModule } from './app-routing.module';
import { HighchartsChartModule } from 'highcharts-angular';
import { ToastrModule } from 'ngx-toastr';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AuthGuard } from './shared/guards/auth.guards';
import { ReactiveFormsModule } from '@angular/forms';

import { DocumentService } from './services/document.service';
import { EventService } from './services/event.service';
import { ThemeModule } from './theme/theme.module';
import { lightTheme } from './theme/light-theme';
import { darkTheme } from './theme/dark-theme';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpInterceptorService } from './shared/interceptor/http-interceptor';
import { MapsModule } from './pages/maps/maps.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({ positionClass: 'toast-bottom-right', preventDuplicates: true }), // ToastrModule added
    SharedModule,
    MapsModule,
    RouterModule.forRoot([]),
    AppRoutingModule,
    LayoutModule,
    HighchartsChartModule,
    DragDropModule,
    ReactiveFormsModule,
    ThemeModule.forRoot({ themes: [lightTheme, darkTheme], active: 'dark' })
  ],
  providers: [
    AuthGuard,
    DocumentService,
    EventService,
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true }
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
