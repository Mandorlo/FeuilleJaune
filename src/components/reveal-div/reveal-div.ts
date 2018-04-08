import { Component, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';



@Component({
  selector: 'reveal-div',
  templateUrl: 'reveal-div.html',
  animations: [trigger('contentState', [
        state('false', style({height:'0px', 'overflow': 'hidden'})),
        state('true', style({height:'*', 'overflow': 'hidden'})),
        transition('false => true', animate('500ms ease-in-out')),
        transition('true => false', animate('500ms ease-in-out'))
    ])]
})
export class RevealDivComponent {

  private contentActive:string = "false";
  private show:boolean = false;

  @Input('title') title:string;

  constructor() {

  }

  toggle() {
    this.show = !this.show;
    this.contentActive = (this.contentActive == "true") ? "false" : "true";
  }

}
