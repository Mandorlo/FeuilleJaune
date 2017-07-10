import { Component, Input } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import moment from 'moment';

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

  cool_date;

  @Input() tr;

  constructor(private transactionService: TransactionService) {
    // console.log('Hello BudgetLineComponent Component');
    // console.log('truc', this.tr)
  }

  ngOnChanges(...args: any[]) {
    console.log("Args", args);
    this.cool_date = moment(args[0].tr.date).format("DD/MM/YY")
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
        console.log("transaction has been deleted ! Grazie Signore !")
      })
      .catch(console.error.bind(console));
  }

}
