import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AlertController } from 'ionic-angular';

import { TransactionService } from '../../services/transaction.service';
import { ParamService } from '../../services/param.service';
import { CurrencyService } from '../../services/currency.service';

import moment from 'moment';




@Component({
  selector: 'budget-line',
  templateUrl: 'budget-line.html'
})
export class BudgetLineComponent {

  private cool_date;
  private category_icon;
  private category_domain;
  private category_pretty;
  private default_currency: string;
  private pretty_montant: string = '';

  @Input() tr;
  @Output('onDeleted') onDeleted: EventEmitter<string> = new EventEmitter<string>();

  constructor(public alertCtrl: AlertController,
              private transactionService: TransactionService,
              private currencyService: CurrencyService,
              private paramService: ParamService) {
    moment.locale('fr');
    this.default_currency = (paramService.currency) ? paramService.currency : 'EUR';
    // console.log('BudgetLineComponent : Benedetto sei Signore, Dio dell\'universo');
  }

  ngOnChanges(...args: any[]) {
    let curr_tr = args[0].tr.currentValue;
    this.pretty_montant = this.currencyService.pretty(curr_tr.montant, curr_tr.currency)
    // console.log(curr_tr);
    this.cool_date = this.getCoolDate(curr_tr.date);
    let cat_list = (curr_tr.type == 'out') ? this.paramService.getCategories() : this.paramService.getCategoriesIn() ;
    let el = cat_list.find(e => e.id == curr_tr.category) //_.find(cat_list, {'id': curr_tr.category});
    this.category_icon = ('icon' in curr_tr) ? curr_tr.icon : this.transactionService.smartIcon(curr_tr);
    // let smart_icon = this.smartIcon(curr_tr);
    // if (smart_icon.length) this.category_icon = smart_icon;
    if (!el) console.log("in budget-lines.ts > ngOnChanges cannot find category for this tr : ", curr_tr, "cat_list = ", cat_list)
    this.category_domain = (el && el['type']) ? el['type'].replace(" ", ""): "";

    this.category_pretty = el.label;
    if (curr_tr.type == 'depot') {
      this.category_pretty = "Dépôt à la banque";
      this.category_domain = "depot";
      // this.category_icon = "fa-angle-double-left";
    } else if (curr_tr.type == 'retrait') {
      this.category_pretty = "Retrait d'argent liquide";
      this.category_domain = "retrait";
      // this.category_icon = "fa-angle-double-right";
    }
  }

  getCoolDate(d) {
    let moment_d = moment(d);
    // let res = moment().diff(moment_d, 'days').humanize();
    let res = moment_d.fromNow();
    return res;
  }

  delete(e, transaction) {
    e.stopPropagation();
    let alert = this.alertCtrl.create({
      title: 'Supprimer',
      message: 'Veux-tu vraiment supprimer la transaction ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            console.log('Suppression de la transaction annulée.');
          }
        },
        {
          text: 'Supprimer',
          handler: () => {
            this.deleteCore(transaction)
          }
        }
      ]
    });
    alert.present();
  }

  deleteCore(transaction) {
    console.log("Deleting...", transaction);
    this.transactionService.delete(transaction)
      .then(d => {
        this.onDeleted.emit("Transaction has been deleted ! Grazie Signore !")
      })
      .catch(err => {
        console.log(err);
        this.onDeleted.emit(JSON.stringify(err))
      });
  }
}
