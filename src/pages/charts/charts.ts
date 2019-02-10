import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { BudgetPage } from '../budget/budget';

import { FjService } from '../../services/fj.service';
import { TransactionService } from '../../services/transaction.service';
import { ParamService } from '../../services/param.service';
import { CurrencyService } from '../../services/currency.service';
import { StatsService } from '../../services/stats.service';

import { Chart } from 'chart.js';
import moment from 'moment';
import { _ } from '../../services/_.service';


@Component({
  selector: 'page-charts',
  templateUrl: 'charts.html',
})
export class ChartsPage {
  @ViewChild('barCanvas') barCanvas;
  @ViewChild('doughnutCanvas') doughnutCanvas;
  @ViewChild('lineCanvas') lineCanvas;

  barChart: any;
  doughnutChart: any;
  lineChart: any;

  private tr_list: any;

  private repartition_depenses_mois:string;
  private repartition_depenses_mois_total:string = "0";
  private last_months:any;

  private depenses_mois_courant:string = '0';
  private moyenne_depenses_mois:string = '0';

  //private mycurrency:string = "";

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private fjService: FjService,
    private paramService: ParamService,
    private currencyService: CurrencyService,
    private statsService: StatsService,
    private trService: TransactionService) {

  }

  ionViewDidEnter() {
    this.reload().catch(err => console.log(err))
  }

  async computeMoisCourant() {
    this.depenses_mois_courant = (await this.trService.getTotalDepensesMonth(moment().startOf('month'))).toFixed(2)
    this.depenses_mois_courant += ' ' + this.paramService.symbolCurrency()

    this.moyenne_depenses_mois = (await this.statsService.fjMoyenneDepenses(12)).toFixed(2)
    this.moyenne_depenses_mois += ' ' + this.paramService.symbolCurrency()
  }

  getLastMonths() {
    this.last_months = [];
    for (let i = 0; i < 7; i++) {
      let mydate = moment().subtract(i, 'months');
      this.last_months.push({ 'date': mydate.format("YYYY-MM") + "-01", 'label': mydate.format('MMMM YYYY') })
    }
  }

  goToHistoPage() {
    this.navCtrl.push(BudgetPage);
  }

  async reload() {
    this.computeMoisCourant().catch(err => console.log(err))
    this.tr_list = await this.trService.getAll();
    //console.log("Transactions loaded ! Grazie Signore !", this.tr_list);
    this.genDataBarTotalDepensesParMois();
    this.genDataPie(this.repartition_depenses_mois, 1);
  }

  genDataPie(mois_ref = "auto", nb_mois = 1) {
    // mois_ref = "YYYY-MM-DD"
    // genere les données de répartition des dépenses sur les nb_mois derniers mois
    let categories = ['maison', 'vie courante', 'transport', 'secretariat', 'banque'];
    let data = [0, 0, 0, 0, 0];
    if (mois_ref == "auto") mois_ref = moment().format("YYYY-MM-DD");
    let date_limit_inf = moment(mois_ref).startOf("month").subtract(nb_mois-1, "months");
    let date_limit_sup = moment(mois_ref).endOf("month");
    //console.log("dates limit charts", date_limit_inf.format('YYYY-MM-DD'), date_limit_sup.format('YYYY-MM-DD'))

    this.tr_list.forEach(tr => {
      let mycat_el = this.paramService.getCategories().find(e => e.id == tr.category);
      let mycat = '';
      if (mycat_el && mycat_el.type) {
        mycat = mycat_el.type;
        if (tr.type == 'out' && date_limit_inf.isSameOrBefore(tr.date) && moment(tr.date).isSameOrBefore(date_limit_sup) && categories.indexOf(mycat) > -1) {
          data[categories.indexOf(mycat)] += this.currencyService.convert(tr.montant, tr.currency)*100;
        }
      }
    });
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.round(data[i])/100
    }

    this.repartition_depenses_mois_total = _.sum(data).toFixed(2).toString();

    this.genPie(categories, data)
  }

  genPie(labels, data) {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {

      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: this.paramService.currency,
          data: data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            // 'rgba(255, 159, 64, 0.2)'
          ],
          hoverBackgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#FF6384",
            "#36A2EB",
            "#FFCE56"
          ]
        }]
      }

    });
  }

  genDataBarTotalDepensesParMois(nb_mois = 6) {
    // genere les données du total dépensé chaque mois sur les nb_mois derniers mois
    let labels = [];
    let data = [];

    // on calcule la prévision de dépenses pour le mois courant si on n'a pas de feuille jaune associée
    let date_start = moment().startOf('month');
    let date_end = moment().endOf('month');
    let currmonth_montant = this.tr_list.map(e => {
      let m = moment(e.date, 'YYYY-MM-DD');
      if (e.type == 'out' && m.isSameOrBefore(date_end) && m.isSameOrAfter(date_start)) return this.currencyService.convert(e.montant, e.currency);
      return 0;
    }).reduce((a,b) => a+b, 0)

    this.fjService.getAllFJ().then(fj_list => {
      for (let i = 0; i < 7; i++) {
        let mydate = moment().subtract(i, 'months');
        labels.push(mydate.format('MMM YY'));
        let res = fj_list.find(e => e.month == mydate.format("YYYY-MM") + "-01");
        if (res) {
          let total = this.fjService.getTotalFJ(res)
          data.push(total.bc);
        } else if (!res && i == 0) {
          data.push(currmonth_montant)
        } else {
          // TODO renvoyer this.trService.getTotalDepensesMonth(mydate) au lieu de 0, (but first, I have to transform this fun in an async fun)
          data.push(0)
        }
      }
      labels = labels.reverse();
      data = data.reverse();

      for (let i = 0; i < data.length; i++) {
        data[i] = Math.round(data[i]*100)/100
      }

      // console.log("Bar chart data : ", labels, data);
      this.genBarTotalDepensesParMois(labels, data)
    }).catch(err => {
      console.log("Impossible de récupérer la liste des feuilles jaunes :(")
    });
  }

  genBarTotalDepensesParMois(labels, data) {
    this.barChart = new Chart(this.barCanvas.nativeElement, {

      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: this.paramService.currency,
          data: data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(54, 162, 235, 0.8)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }

    });
  }

  ionViewDidLoad() {
    console.log('ChartsPage: Heureux l\'homme qui remet sa vie entre les mains du Père.');
    this.getLastMonths();
    //this.mycurrency = this.paramService.symbolCurrency();
    this.repartition_depenses_mois = this.last_months[0].date;
    this.reload();
  }

}
