import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Generated class for the RadioSquareComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'radio-square',
  templateUrl: 'radio-square.html'
})
export class RadioSquareComponent {

  public optionsValue: any[];

  @Input() options;
  @Input('choice') choice:string;
  @Output() choiceChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
    // console.log('RadioSquareComponent loaded, lodato sia il Signore !');
  }

  ngOnChanges(...args: any[]) {
    // console.log("Args", args);
    this.optionsValue = args[0].options;
  }

  handleChange(val) {
    this.choice = val;
    this.choiceChange.emit(this.choice);
  }

}
