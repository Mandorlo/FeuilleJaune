import { Injectable } from '@angular/core';

import { ParamService } from './param.service';
import { TransactionService } from './transaction.service';
import { CurrencyService } from './currency.service';
import { FjService } from './fj.service';

import moment from 'moment';
import _ from 'lodash';

@Injectable()
export class StatsService {


    constructor(private fjService: FjService,
        private paramService: ParamService,
        private trService: TransactionService,
        private currencyService: CurrencyService) {


    }

    // renvoie la moyenne des depenses de mes FJ sur les @last_n_monts derniers mois
    // si last_n_months = 0, on renvoie la moyenne depusi le début
    async fjMoyenneDepenses(last_n_months = 0, currency = null) {
        if (!currency) currency = this.paramService.currency;

        // on récupère la liste des FJ, on filtre éventuellement
        let fj_list = await this.fjService.getAllFJ()
        let today = moment().startOf('month')
        if (last_n_months > 0) fj_list = fj_list.filter(fj => {
            let diff_months = today.diff(moment(fj.month, 'YYYY-MM-DD'), 'months');
           return diff_months <= last_n_months
        })

        // on calcule la moyenne
        if (!fj_list || !fj_list.length) return 0;
        return Math.round(_.sum(fj_list.map(fj => this.fjService.getTotalFJ(fj, currency).bc))*100 / fj_list.length)/100;
    }

    

}