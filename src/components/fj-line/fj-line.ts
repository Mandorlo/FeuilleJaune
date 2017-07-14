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

  banqueValue: string;
  caisseValue: string;

  @Input('line') line_num;
  @Input('label') label: string;
  @Input('banque') banque: string;
  @Output() banqueChange: EventEmitter<string> = new EventEmitter<string>();
  @Input('caisse') caisse: string;
  @Output() caisseChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() observations: string;
  @Output() observationsChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() {}

  isMontantNonNul(m) {
    return (typeof m === "number" && m != 0)
  }

  parseDecimal(n) {
    if (n === null) n = 0;
    return n
  }

}
