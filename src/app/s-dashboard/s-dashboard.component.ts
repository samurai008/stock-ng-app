import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StockService } from './stock.service';
import { switchMap } from 'rxjs/operators';
import { removeSummaryDuplicates } from '@angular/compiler';

@Component({
  selector: 'app-s-dashboard',
  templateUrl: './s-dashboard.component.html',
  styleUrls: ['./s-dashboard.component.css']
})
export class SDashboardComponent implements OnInit {
  @Input() refreshFrequency: number;

  @Output() stocksWillLoad = new EventEmitter<any>();
  @Output() stocksDidLoad = new EventEmitter<any>();
  @Output() stocksBought = new EventEmitter<any>();
  @Output() stocksSold = new EventEmitter<any>();

  checkboxList = {};
  stockList = [];
  portfolio;
  isPortfolioEmpty = true;
  sellSelectedState = true;

  constructor(private stockService: StockService) { }

  ngOnInit() {
    this.stockService.pollStockData(this.refreshFrequency, this.stocksWillLoad).subscribe((stocks: any) => {
      console.log(stocks.body);
      if (!this.portfolio) {
        this.portfolio = stocks.portfolio;
        const portfolioBuysHashMap = {};
        if (this.portfolio.data.buys.length > 0) {
          for (const stock of this.portfolio.data.buys) {
            stock.units = 1;
            portfolioBuysHashMap[stock.id] = stock;
          }
        }
        this.isPortfolioEmpty = !this.objectHasKeys(portfolioBuysHashMap);
        this.portfolio.data.buys = portfolioBuysHashMap;
      }
      if (stocks.data.length > 0) {
        this.stockList = stocks.data.map((stock, index) => {
          if (this.stockList.length > 0) {
            stock.differential = stock.price - this.stockList[index].price;
          } else {
            stock.differential = 0;
          }
          return stock;
        });
        for (const stock of this.stockList) {
          if (this.portfolio.data.buys[stock.id]) {
            stock.units = this.portfolio.data.buys[stock.id].units;
            this.portfolio.data.buys[stock.id] = stock;
          }
        }
        this.stocksDidLoad.emit('List Updated');
      } else {
        this.stocksDidLoad.emit('Cannot fetch stocks');
      }
    }, console.log);
  }

  buyStock(stock) {
    this.stockService.buyStock(stock).subscribe(
      response => {
        console.log(response);
        switch (response.status) {
          case 403:
            this.stocksBought.emit('Cannot buy stock! Insufficient balance');
            break;
          case 200:
            if (this.portfolio.data.cash >= stock.price) {
              this.stocksBought.emit('Successfully bought stock ' + stock.name);
              if (!this.portfolio.data.buys[stock.id]) {
                this.portfolio.data.buys[stock.id] = stock;
                stock.units = 1;
              } else {
                this.portfolio.data.buys[stock.id].units++;
              }
              this.portfolio.data.cash = this.portfolio.data.cash - stock.price;
            } else {
              this.stocksBought.emit('Cannot buy stock! Insufficient balance');
            }
            this.isPortfolioEmpty = !this.objectHasKeys(this.portfolio.data.buys);
            break;
          case 500:
            this.stocksBought.emit('Cannot buy stock! Server Error!');
            break;
        }
      }
    );


  }

  sellStock(stock, overrideEvent) {
    this.stockService.sellStock(stock).subscribe(
      response => {
        switch (response.status) {
          case 200:
            if (!overrideEvent) {
              this.stocksSold.emit('Success sold stock ' + stock.name);
            }
            this.portfolio.data.cash = this.portfolio.data.cash + this.portfolio.data.buys[stock.id].price;
            const stockUnits = this.portfolio.data.buys[stock.id].units;
            // update the reference
            if (stockUnits - 1 === 0) {
              delete this.portfolio.data.buys[stock.id];
            } else {
              this.portfolio.data.buys[stock.id].units = stockUnits - 1;
            }
            this.isPortfolioEmpty = !this.objectHasKeys(this.portfolio.data.buys);
            break;
          case 403:
            this.stocksSold.emit('Cannot sell stock! Insufficient units');
            break;
          case 500:
            this.stocksSold.emit('Cannot sell stock! Server Error!');
            break;
        }
      }
    );
  }

  onCheckboxChange(stockOwned) {
    if (!this.checkboxList[stockOwned.id]) {
      this.checkboxList[stockOwned.id] = stockOwned;
    } else {
      delete this.checkboxList[stockOwned.id];
    }
    this.sellSelectedState = Object.keys(this.checkboxList).length === 0 ? true : false;
  }

  isChecked(stockId) {
    return typeof this.checkboxList[stockId] !== 'undefined';
  }

  sellMultipleStocks() {
    for (const stockId in this.checkboxList) {
      if (this.checkboxList[stockId]) {
        this.sellStock(this.checkboxList[stockId], true);
        delete this.checkboxList[stockId];
        this.sellSelectedState = Object.keys(this.checkboxList).length === 0 ? true : false;
      }
    }
  }

  objectHasKeys(obj) {
    return Object.keys(obj).length > 0;
  }
}
