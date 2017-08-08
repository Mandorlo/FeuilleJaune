import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { ParamService } from '../../services/param.service';
import moment from 'moment';
import _ from 'lodash';

/**
 * Generated class for the BudgetLineComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'budget-line',
  templateUrl: 'budget-line.html'
})
export class BudgetLineComponent {

  private cool_date;
  private category_icon;
  private category_domain;
  private category_pretty;

  @Input() tr;
  @Output('onDeleted') onDeleted: EventEmitter<string> = new EventEmitter<string>();

  constructor(private transactionService: TransactionService,
              private paramService: ParamService) {
    moment.locale('fr');
    // console.log('BudgetLineComponent : Benedetto sei Signore, Dio dell\'universo');
  }

  ngOnChanges(...args: any[]) {
    let curr_tr = args[0].tr.currentValue;
    // console.log(curr_tr);
    this.cool_date = this.getCoolDate(curr_tr.date);
    let cat_list = (curr_tr.type == 'out') ? this.paramService.categories : this.paramService.categories_in ;
    let el = _.find(cat_list, {'id': curr_tr.category});
    this.category_icon = el.icon;
    let smart_icon = this.smartIcon(curr_tr);
    if (smart_icon.length) this.category_icon = smart_icon;
    this.category_domain = (el.type) ? el.type.replace(" ", ""): "";

    this.category_pretty = el.label;
    if (curr_tr.type == 'depot') {
      this.category_pretty = "Dépôt à la banque";
      this.category_domain = "depot";
      this.category_icon = "fa-angle-double-left";
    } else if (curr_tr.type == 'retrait') {
      this.category_pretty = "Retrait d'argent liquide";
      this.category_domain = "retrait";
      this.category_icon = "fa-angle-double-right";
    }
  }

  smartIcon(tr) {
    let nom = tr.name.toLowerCase();
    if (nom.indexOf("vol ") > -1 || nom.indexOf("avion") > -1 || nom.indexOf("flight") > -1 || nom.indexOf("plane") > -1) {
      return "fa-plane"
    } else if (nom.indexOf("hairdresser") > -1 || nom.indexOf("coiffeur") > -1) {
      return "fa-scissors"
    } else if (nom.indexOf("taxi") > -1 || nom.indexOf("cab") > -1) {
      return "fa-cab"
    } else if (nom.indexOf("metro") > -1 || nom.indexOf("subway") > -1) {
      return "fa-subway"
    } else {
      return ""
    }
  }

  getCoolDate(d) {
    let moment_d = moment(d);
    // let res = moment().diff(moment_d, 'days').humanize();
    let res = moment_d.fromNow();
    return res;
  }

  showDetail(transaction) {
    /*let modal = this.modalCtrl.create(DetailsPage, { transaction: transaction });
    modal.present();*/
    alert("TODO.... sorry :-S Mais prie le Seigneur pour que j'aie plus de temps :)")
  }

  delete(transaction) {
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
