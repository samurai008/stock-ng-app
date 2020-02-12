import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SDashboardModule } from './s-dashboard/s-dashboard.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    SDashboardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
