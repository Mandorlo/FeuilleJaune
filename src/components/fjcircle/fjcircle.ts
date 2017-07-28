import { Component, Input } from '@angular/core';

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

  constructor(private fjService: FjService) {
    // console.log('Hello FjcircleComponent Component');
    moment.locale('fr');
  }

  shareFJ(month) {
    this.fjService.shareFJ(month);
  }

}
