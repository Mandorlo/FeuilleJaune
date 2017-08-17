import { Component, Input } from '@angular/core';



@Component({
  selector: 'gauge',
  templateUrl: 'gauge.html'
})
export class GaugeComponent {

  @Input('level') level;
  @Input('text') text;
  @Input('min') min;
  @Input('max') max;

  private strokeDash:string;

  constructor() {

  }

  ngOnChanges(...args: any[]) {
    let mini = (args[0].min) ? parseInt(args[0].min.currentValue) : parseInt(this.min);
    let maxi = (args[0].max) ? parseInt(args[0].max.currentValue) : parseInt(this.max);
    let v = Math.max(0, (parseInt(args[0].level.currentValue) - mini) * 230 / (maxi - mini));
    v = Math.min(230, v);
    this.strokeDash = v.toString() + ", 500";
  }

}
