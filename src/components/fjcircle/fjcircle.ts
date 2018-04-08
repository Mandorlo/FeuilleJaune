import { Component, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Gesture } from "ionic-angular/gestures/gesture";

import { FjService } from '../../services/fj.service';

import moment from 'moment';

/**
 * Generated class for the FjcircleComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'fjcircle',
  templateUrl: 'fjcircle.html'
})
export class FjcircleComponent {

  @Input() fj;
  private mymonth: string;
  private processing_ongoing: boolean = false;

  el: HTMLElement;
  pressGesture: Gesture;
  @Output('long-press') onPressRelease: EventEmitter<any> = new EventEmitter();

  constructor(private fjService: FjService, el: ElementRef) {
    // console.log('Hello FjcircleComponent Component');
    moment.locale('fr');
    this.el = el.nativeElement;
  }

  ngOnChanges(...args: any[]) {
    let curr_fj = args[0].fj.currentValue;
    this.mymonth = moment(curr_fj.month).format("MMM YYYY");
  }

  ngOnInit() {
    this.pressGesture = new Gesture(this.el);
    this.pressGesture.listen();
    this.pressGesture.on('press', (event) => {
      this.onPressRelease.emit('released');
    });
  }

  ngOnDestroy() {
    this.pressGesture.destroy();
  }

  shareFJ(month) {
    this.processing_ongoing = true;
    this.fjService.shareFJ(month).then(_ => {
      this.processing_ongoing = false;
    }).catch(err => {
      console.log(err); // TODO
      this.processing_ongoing = false;
    });
  }

}
