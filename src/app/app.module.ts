import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MaterialModule } from './material/material.module';
import { NgModule } from '@angular/core';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { AppWorker } from './app.worker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BreakpointModule } from './breakpoint/breakpoint.module';
import { HomeModule } from './home/home.module';
import { LayoutModule } from './layout/layout.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WorkerModule } from 'angular-web-worker/angular';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AgGridModule.withComponents([]),
    BrowserModule,
    HttpClientModule,
    MaterialModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    WorkerModule.forWorkers([
      { worker: AppWorker, initFn: () => new Worker('./app.worker.ts', { type: 'module' }) },
    ]),
    BrowserAnimationsModule,
    BreakpointModule,
    HomeModule,
    LayoutModule,
    NgbModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }