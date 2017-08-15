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

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private fjService: FjService,
    private paramService: ParamService,
    private trService: TransactionService) {

  }

  ionViewDidEnter() {
    this.reload();
  }

  goToHistoPage() {
    this.navCtrl.push(BudgetPage);
  }

  reload() {
    this.trService.getAll().then(trlist => {
      this.tr_list = trlist;
      // console.log("Transactions loaded ! Grazie Signore !");
      this.genDataBarTotalDepensesParMois();
      this.genDataPie();
    }).catch(err => {
      console.log("Impossible de charger les transactions", err)
    });
  }

  genDataPie(nb_mois = 1) {
    // genere les données de répartition des dépenses sur les nb_mois derniers mois
    let categories = ['maison', 'vie courante', 'transport', 'secretariat', 'banque'];
    let data = [0, 0, 0, 0, 0];
    let date_limit = moment().startOf("month").subtract(nb_mois-1, "months");

    this.tr_list.forEach(tr => {
      let mycat = _.find(this.paramService.categories, { 'id': tr.category });
      if (mycat && mycat.type) {
        mycat = mycat.type;
        if (tr.type === 'out' && date_limit.isBefore(tr.date) && categories.indexOf(mycat) > -1) {
          data[categories.indexOf(mycat)] += parseFloat(tr.montant);
        }
      }
    });

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

    this.reload();

    // this.lineChart = new Chart(this.lineCanvas.nativeElement, {
    //
    //   type: 'line',
    //   data: {
    //     labels: ["January", "February", "March", "April", "May", "June", "July"],
    //     datasets: [
    //       {
    //         label: "My First dataset",
    //         fill: false,
    //         lineTension: 0.1,
    //         backgroundColor: "rgba(75,192,192,0.4)",
    //         borderColor: "rgba(75,192,192,1)",
    //         borderCapStyle: 'butt',
    //         borderDash: [],
    //         borderDashOffset: 0.0,
    //         borderJoinStyle: 'miter',
    //         pointBorderColor: "rgba(75,192,192,1)",
    //         pointBackgroundColor: "#fff",
    //         pointBorderWidth: 1,
    //         pointHoverRadius: 5,
    //         pointHoverBackgroundColor: "rgba(75,192,192,1)",
    //         pointHoverBorderColor: "rgba(220,220,220,1)",
    //         pointHoverBorderWidth: 2,
    //         pointRadius: 1,
    //         pointHitRadius: 10,
    //         data: [65, 59, 80, 81, 56, 55, 40],
    //         spanGaps: false,
    //       }
    //     ]
    //   }
    //
    // });

  }

}
