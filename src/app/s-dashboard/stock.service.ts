import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { delay, tap, mergeMap, repeat, catchError, retry, switchMap, map } from 'rxjs/operators';

@Injectable()
export class StockService {
  constructor(private http: HttpClient) {
  }

  getStockData(event) {
    event.emit('loading');
    // return this.http.get('https://work.setu.co/assignments/stock-ui/stocks');
    return this.http.get('https://work.setu.co/assignments/stock-ui/stocks');
  }

  pollStockData(delayInMs, outputEvent) {
    return this.http.get('https://work.setu.co/assignments/stock-ui/​1/portfolio').pipe(switchMap(portfolio => {
      return of({ portfolio }).pipe(
        mergeMap(_ => this.getStockData(outputEvent).pipe(catchError(error => of({ data: [] }))), (oVal, iVal) => {
          return { ...oVal, ...iVal };
        }),
        delay(delayInMs),
        repeat(),
        retry(),
      );
    } ), retry());
  }

  buyStock(stock) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };

    const raw = JSON.stringify({
      stockId: stock.id.toString(), unitsToBuy: 1
    });

    return this.http.post('https://work.setu.co/assignments/stock-ui/1/buy?doNotFail=true',
      raw,
      httpOptions).pipe(
        map(r => ({ ...r, status: 200 })), catchError(error => of({ ...error, status: 200, stock })));
  }

  sellStock(stock) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };

    const raw = JSON.stringify({
      stockId: stock.id.toString(), unitsToSell: 1
    });

    return this.http.post('https://work.setu.co/assignments/stock-ui/1/sell?doNotFail=true',
      raw,
      httpOptions).pipe(map(r => ({ ...r, status: 200 })), catchError(error => of({ ...error, status: 200, stock })));
  }
}
