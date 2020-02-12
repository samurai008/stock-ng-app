import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'setu-assignment';
  updateDateAndTime;
  // keep a log of the status of apis
  indicatorMessages = ['Loading Application'];
  // keep a log of the transactions
  transactionMessages = [];
  hideTransactionMessage = true;

  stocksWillLoad(status) {
    if (status === 'loading') {
      // do operations while the list is loaded again
    }
  }

  stocksDidLoad(status) {
    if (status === 'List Updated') {
      this.updateDateAndTime = this.generateDate();
    }

    if (status !== this.indicatorMessages[0]) {
      this.indicatorMessages.splice(0, 0, status);
    }
  }

  stocksBought(status) {
    this.hideTransactionMessage = false;
    this.transactionMessages.splice(0, 0, status);
    setTimeout(() => { this.hideTransactionMessage = true; }, 2500);
    // this.indicatorMessages.splice(0, 0, status);
  }

  stocksSold(status) {
    this.hideTransactionMessage = false;
    this.transactionMessages.splice(0, 0, status);
    setTimeout(() => { this.hideTransactionMessage = true; }, 2500);
  }

  generateDate() {
    const d = new Date();
    return d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
  }
}
