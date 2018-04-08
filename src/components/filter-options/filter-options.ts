import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'filter-options',
  templateUrl: 'filter-options.html'
})
export class FilterOptionsComponent {

  @Input('title') title;
  @Input() options;
  @Input('selected') selected;
  @Output() selectedChange: EventEmitter<string> = new EventEmitter<string>();

  constructor() {

  }

  ngOnChanges(...args: any[]) {
    // console.log("Args", args);
    // console.log(this.options)
  }

  handleChange(val) {
    if (!this.selected) this.selected = [];
    if (this.selected.indexOf(val) > -1)
      this.selected = this.selected.filter(item => item != val);
    else
      this.selected.push(val);
    // console.log(this.selected)
    this.selectedChange.emit(this.selected);
  }

}
