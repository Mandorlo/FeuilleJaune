import { Component, NgZone } from '@angular/core';
import { IonicPage, ModalController, NavController, Platform, NavParams } from 'ionic-angular';
import { TransactionService } from '../../services/transaction.service';
import { DetailsPage } from '../details/details';

/**
 * Generated class for the BudgetPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-budget',
  templateUrl: 'budget.html',
})
export class BudgetPage {
  public transactions = [];

  constructor(private transactionService: TransactionService,
    public navCtrl: NavController,
    private platform: Platform,
    private zone: NgZone,
    private modalCtrl: ModalController,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      this.transactionService.initDB();

      this.transactionService.getAll()
        .then(data => {
          this.zone.run(() => {
            this.transactions = data;
          });
        })
        .catch(console.error.bind(console));
    });
    console.log('ionViewDidLoad BudgetPage');
  }

  showDetail(transaction) {
    let modal = this.modalCtrl.create(DetailsPage, { transaction: transaction });
    modal.present();
  }

}
