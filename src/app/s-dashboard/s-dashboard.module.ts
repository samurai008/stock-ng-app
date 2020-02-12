import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SDashboardComponent } from './s-dashboard.component';
import { StockService } from './stock.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [SDashboardComponent],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [SDashboardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    StockService
  ]
})
export class SDashboardModule { }
