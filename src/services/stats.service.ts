import { Injectable } from '@angular/core';

import { ParamService } from './param.service';
import { TransactionService } from './transaction.service';
import { CurrencyService } from './currency.service';
import { FjService } from './fj.service';

import moment from 'moment';
import { _ } from './_.service';

@Injectable()
export class StatsService {
    private WARNINGS = {
        /* 'listeTransactions': { // TODO BUGFIX
            'fun': this.checkWarnings_listeTransactions,
            'async': true
        }, */
        'soldeNegatif': {
            'fun': this.checkWarnings_soldeNegatif
        },
        'reportMoisPrecedent': {
            'fun': this.checkWarnings_ReportSoldeMoisPrecedent
        }
    }


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

    // renvoie des messages d'avertissement de/des FJ en paramètre (par ex si le solde est < 0)
    async getWarnings(fj_o_or_list = null) {
        // on rend le paramètre propre
        let fj_list = fj_o_or_list;
        if (fj_list === null) fj_list = await this.fjService.getAllFJ({soustotaux: true})
        if (!fj_list.length && typeof fj_list.length != 'number') fj_list = [fj_list]

        let warnings = {}
        for (let fj of fj_list) {
            let o = {}
            let msg = []
            for (let warn in this.WARNINGS) {
                let res;
                if (this.WARNINGS[warn].async) {
                    res = await this.WARNINGS[warn].fun.bind(this)(fj, fj_list)
                } else {
                    res = this.WARNINGS[warn].fun.bind(this)(fj, fj_list)
                }
                if (res && res.msg) {
                    o[warn] = res
                    msg.push(res.msg)
                }
            }
            warnings[fj.month] = {msg: msg.join(' - '), details: o}
        }
        return warnings
    }

    // =========================================================================
    //                    CHECK WARNINGS
    // =========================================================================

    // vérifie que les dépenses et revenus de la fj correspondent bien à la liste des dépenses/revenus des transactions
    async checkWarnings_listeTransactions(fj, fj_list) {
        let warnings = []
        let fj_theorique = await this.fjService.genFjData(fj.month)
        for (let currency in fj.data) {
            console.log("fj_theorique", fj_theorique)
            let depense_tr = this.fjService.soustotal(fj_theorique, currency, 'total') // tkt 'total' c'est total des sorties
            let depense_fj = this.fjService.soustotal(fj, currency, 'total') // tkt 'total' c'est total des sorties
            let revenus_tr = this.fjService.soustotal(fj_theorique, currency, 'in')
            let revenus_fj = this.fjService.soustotal(fj, currency, 'in')
            let details = {currency, depenses: {tr: depense_tr, fj: depense_fj}, revenus: {tr: revenus_tr, fj: revenus_fj}}
            if (depense_tr.banque != depense_fj.banque) return {msg: `Les dépenses banque en ${currency} ne correspondent pas aux dépenses réelles`, details}
            if (depense_tr.caisse != depense_fj.caisse) return {msg: `Les dépenses caisse en ${currency} ne correspondent pas aux dépenses réelles`, details}
            if (revenus_tr.banque != revenus_fj.banque) return {msg: `Les revenus banque en ${currency} ne correspondent pas aux revenus réels`, details}
            if (revenus_tr.caisse != revenus_fj.caisse) return {msg: `Les revenus caisse en ${currency} ne correspondent pas aux revenus réels`, details}
        }
    }

    // vérifie que le solde de cette FJ est bien positif
    // si solde négatif, renvoie un message de warning
    checkWarnings_soldeNegatif(fj, fj_list) {
        let warnings = []
        for (let currency in fj.data) {
            let o = {currency}
            let solde = this.fjService.soustotal(fj, currency, 'solde')
            if (solde.banque < 0) o['banque'] = this.currencyService.pretty(solde.banque, currency);
            if (solde.caisse < 0) o['caisse'] = this.currencyService.pretty(solde.caisse, currency);
            if (o['banque'] || o['caisse']) warnings.push(o)
        }
        // on construit un message texte à partir de l'objet warnings :
        if (warnings.length == 0) return {msg: '', details: warnings}
        let mycurrencies = Object.getOwnPropertyNames(fj.data);
        if (warnings.length > 1) {
            return {msg: `Le solde est négatif pour les devises suivantes : ${mycurrencies.join(', ')}`, details: warnings}
        } else {
            if (warnings[0]['banque'] && warnings[0]['caisse']) return {msg: `Le solde banque et caisse sont négatifs ! (${warnings[0]['banque']} pour banque et ${warnings[0]['caisse']} pour caisse)`, details: warnings};
            else if (warnings[0]['banque']) return {msg: `Le solde banque est négatif : ${warnings[0]['banque']}`, details: warnings};
            else if (warnings[0]['caisse']) return {msg: `Le solde caisse est négatif : ${warnings[0]['caisse']}`, details: warnings};
        }
    }

    // vérifie que le report du solde du mois précédent est bon
    checkWarnings_ReportSoldeMoisPrecedent(myfj, fj_list) {
        let mymonth = moment(myfj.month, 'YYYY-MM-DD')

        // check if myfj is the first FJ of all times
        let res = fj_list.find(fj => mymonth.diff(moment(fj.month, 'YYYY-MM-DD')) > 0)
        if (!res) return;

        // if not we get the last month FJ
        let fj_lastmonth = fj_list.find(fj => mymonth.diff(moment(fj.month, 'YYYY-MM-DD'), 'months') == 1)
        if (!fj_lastmonth) return {msg: `Aucune Feuille Jaune n'a été créée le mois précédent !`}
        
        let details = {}
        for (let currency in fj_lastmonth.data) {
            if (!myfj.data[currency]) return {msg: `Problème, il faudrait créer une Feuille Jaune en ${currency} pour ce mois-ci...`}
            let solde_caisse_ok = fj_lastmonth.data[currency].soustotaux.solde.caisse == myfj.data[currency].report_mois_precedent.caisse;
            let solde_banque_ok = fj_lastmonth.data[currency].soustotaux.solde.banque == myfj.data[currency].report_mois_precedent.banque;
            details[currency] = {
                lastmonth: {
                    caisse: fj_lastmonth.data[currency].soustotaux.solde.caisse,
                    banque: fj_lastmonth.data[currency].soustotaux.solde.banque
                },
                thismonth: {
                    caisse: myfj.data[currency].report_mois_precedent.caisse,
                    banque: myfj.data[currency].report_mois_precedent.banque
                }
            }
            if (!solde_caisse_ok && !solde_banque_ok) return {msg: `Le report du solde du mois précédent en ${currency} ne correspond pas au mois précédent !`, details: details[currency]}
            if (!solde_caisse_ok) return {msg: `Le report du solde caisse du mois précédent en ${currency} ne correspond pas au mois précédent !`, details: details[currency]}
            if (!solde_banque_ok) return {msg: `Le report du solde banque du mois précédent en ${currency} ne correspond pas au mois précédent !`, details: details[currency]}
        }
    }
}