import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Generated class for the FjLineComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'fj-line',
  templateUrl: 'fj-line.html'
})
export class FjLineComponent {

  @Input('line') line_num;
  @Input('label') label: string;
  @Input('banque') banque: string;
  @Output() banqueChange: EventEmitter<string> = new EventEmitter<string>();
  @Input('caisse') caisse: string;
  @Output() caisseChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() observations: string;
  @Output() observationsChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
    // console.log('Hello FjLineComponent Component');
  }

  deleteTransaction(item) {
    console.log(item)
  }

  parseDecimal(s) {
    let res = s.match(/\-?\s*[0-9]+[\,\.]?[0-9]*/g);
    if (res && res[0] == s) {
      return parseFloat(s.replace(',','.').replace(/\s/g, ''))
    } else {
      // console.log(s + " is not an amount !")
    }
    return 0
  }

}
