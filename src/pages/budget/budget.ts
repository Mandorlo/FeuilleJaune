import { Component, NgZone } from '@angular/core';
import { IonicPage, ModalController, NavController, Platform, NavParams } from 'ionic-angular';
import { TransactionService } from '../../services/transaction.service';
import { DetailsPage } from '../details/details';
// import { BudgetLineComponent } from '../../components/budget-line/budget-line'; // TODO remove ?
import moment from 'moment';

moment.locale('fr');

// TODO : create an Angular 2 Pipe to order list by date for ex (see here : https://forum.ionicframework.com/t/order-a-list/55389)

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

}
