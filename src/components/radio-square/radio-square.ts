import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'radio-square',
  templateUrl: 'radio-square.html'
})
export class RadioSquareComponent {

  public optionsValue: any[];
  public ui_fit:boolean = false;

  @Input() options;
  @Input('choice') choice:string;
  @Output() choiceChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() {

  }

  ngOnChanges(...args: any[]) {
    // console.log("Args", args);
    this.optionsValue = args[0].options;
    this.ui_fit = (this.options.length > 4);
  }

  handleChange(val) {
    this.choice = val;
    this.choiceChange.emit(this.choice);
  }

}
