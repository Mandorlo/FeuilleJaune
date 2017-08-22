import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { BudgetPage } from '../budget/budget';

import { FjService } from '../../services/fj.service';
import { TransactionService } from '../../services/transaction.service';
import { ParamService } from '../../services/param.service';

import { Chart } from 'chart.js';
import moment from 'moment';
import _ from 'lodash';



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

  private mycurrency:string = "";

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private fjService: FjService,
    private paramService: ParamService,
    private trService: TransactionService) {

  }

  ionViewDidEnter() {
    this.reload();
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

  reload() {
    this.trService.getAll().then(trlist => {
      this.tr_list = trlist;
      // console.log("Transactions loaded ! Grazie Signore !");
      this.genDataBarTotalDepensesParMois();
      this.genDataPie(this.repartition_depenses_mois, 1);
    }).catch(err => {
      console.log("Impossible de charger les transactions", err)
    });
  }

  genDataPie(mois_ref = "auto", nb_mois = 1) {
    // mois_ref = "YYYY-MM-DD"
    // genere les données de répartition des dépenses sur les nb_mois derniers mois
    let categories = ['maison', 'vie courante', 'transport', 'secretariat', 'banque'];
    let data = [0, 0, 0, 0, 0];
    if (mois_ref == "auto") mois_ref = moment().format("YYYY-MM-DD");
    let date_limit_inf = moment(mois_ref).startOf("month").subtract(nb_mois-1, "months");
    let date_limit_sup = moment(mois_ref).endOf("month");

    this.tr_list.forEach(tr => {
      let mycat = _.find(this.paramService.categories, { 'id': tr.category });
      if (mycat && mycat.type) {
        mycat = mycat.type;
        if (tr.type === 'out' && date_limit_inf.isBefore(tr.date) && moment(tr.date).isBefore(date_limit_sup) && categories.indexOf(mycat) > -1) {
          data[categories.indexOf(mycat)] += parseFloat(tr.montant);
        }
      }
    });

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

    this.fjService.getAllFJ().then(fj_list => {
      for (let i = 0; i < 7; i++) {
        let mydate = moment().subtract(i, 'months');
        labels.push(mydate.format('MMM YY'));
        let res = _.find(fj_list, { 'month': mydate.format("YYYY-MM") + "-01" });
        if (res) data.push(parseFloat(res.data.total_bc));
        else data.push(0)
      }
      labels = labels.reverse();
      data = data.reverse();
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
          // backgroundColor: [
          //   'rgba(255, 99, 132, 0.2)',
          //   'rgba(54, 162, 235, 0.2)',
          //   'rgba(255, 206, 86, 0.2)',
          //   'rgba(75, 192, 192, 0.2)',
          //   'rgba(153, 102, 255, 0.2)',
          //   'rgba(255, 159, 64, 0.2)'
          // ],
          // borderColor: [
          //   'rgba(255,99,132,1)',
          //   'rgba(54, 162, 235, 1)',
          //   'rgba(255, 206, 86, 1)',
          //   'rgba(75, 192, 192, 1)',
          //   'rgba(153, 102, 255, 1)',
          //   'rgba(255, 159, 64, 1)'
          // ],
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
    this.mycurrency = this.paramService.symbolCurrency();
    this.repartition_depenses_mois = this.last_months[0].date;
    this.reload();
  }

}
