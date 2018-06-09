import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

import { TransactionService } from '../../services/transaction.service';

import moment from 'moment';

/**
 * Generated class for the FjObservationsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-fj-observations',
  templateUrl: 'fj-observations.html',
})
export class FjObservationsPage {
  public category: string;
  public currency: string;
  public month: string;
  public pretty_month: string;
  public comments: string;
  public tr_list: Array<Object>;
  public tr_ready:boolean = false;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public viewCtrl: ViewController,
              private trService: TransactionService) {

    this.category = this.navParams.get('category')
    this.currency = this.navParams.get('currency')
    this.month = this.navParams.get('month')
    this.comments = this.navParams.get('comments')
    this.pretty_month = moment(this.month, 'YYYY-MM-DD').format('MMMM YYYY')

    this.trService.getTrMonthCurrency(this.month, this.currency).then(data => {
      this.tr_list = data.filter(tr => tr.category == this.category);
      this.tr_ready = true
    }).catch(err => {
      console.log('ERROR while retrieving list of transactions', this.month, this.currency, err)
    })
  }

  ionViewDidLoad() {
    console.log('FjObservationsPage - Rendons gloire à notre Dieu, lui qui fit des merveilles !');
  }

  stopPropa(e) {
    console.log('event', e)
    e.stopPropagation()
  }

  close(e) {
    if (e.srcElement.className == 'scroll-content'
        || e.srcElement.localName == 'h3') this.navCtrl.pop()
  }

  submitComments() {
    this.viewCtrl.dismiss(this.comments)
  }

}
