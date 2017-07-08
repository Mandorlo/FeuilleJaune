import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { TransactionService } from '../../services/transaction.service';

/**
 * Generated class for the DetailsPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage {
  public transaction: any = {};
  public isNew = true;
  public action = 'Add';
  public isoDate = '';


  constructor(public navCtrl: NavController,
    private viewCtrl: ViewController,
    public navParams: NavParams,
    private transactionService: TransactionService) {
  }

  ionViewDidLoad() {
    let editTransaction = this.navParams.get('transaction');

    if (editTransaction) {
      this.transaction = editTransaction;
      this.isNew = false;
      this.action = 'Edit';
      this.isoDate = this.transaction.date.toISOString().slice(0, 10);
    }
    console.log('ionViewDidLoad DetailsPage');
  }

  save() {
    this.transaction.date = new Date(this.isoDate);

    if (this.isNew) {
      this.transactionService.add(this.transaction)
        .catch(console.error.bind(console));
    } else {
      this.transactionService.update(this.transaction)
        .catch(console.error.bind(console));
    }

    this.dismiss();
  }

  delete() {
    this.transactionService.delete(this.transaction)
      .catch(console.error.bind(console));

    this.dismiss();
  }

  dismiss() {
    this.viewCtrl.dismiss(this.transaction);
  }

}
