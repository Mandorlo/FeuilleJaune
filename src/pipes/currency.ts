import {Pipe} from '@angular/core';

@Pipe({
  name: 'currency'
})
export class CurrencyPipe {
  transform(value, args) {
    let myval;
    if (typeof value == 'string') {
      let nval = parseFloat(value);
      myval = (nval == 0) ? "0" : nval.toFixed(2).toString();
    } else {
      myval = (value == 0) ? "0" : (value).toFixed(2).toString();
    }
    return myval;
  }
}
