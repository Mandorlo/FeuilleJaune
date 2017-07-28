import { Component } from '@angular/core';

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

  text: string;

  constructor() {
    console.log('Hello FjcircleComponent Component');
    this.text = 'Hello World';
  }

}
