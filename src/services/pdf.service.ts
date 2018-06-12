import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file';
import { ToastController, Platform } from 'ionic-angular';
import { ParamService } from './param.service';
import { SocialSharing } from '@ionic-native/social-sharing';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

import moment from 'moment';

declare var pdfMake: any;
pdfMake.vfs = pdfFonts.pdfMake.vfs;


@Injectable()
export class PdfService {
  constructor(private paramService: ParamService,
    public toastCtrl: ToastController,
    private file: File,
    private socialSharing: SocialSharing,
    public ptfm: Platform) {
    moment.locale('fr');
  }

  rendereGrazie() {
    console.log("Lodato sia il Signore !")
  }

  private prettyCurrency(amount) {
    if (amount == "" || amount == 0) return "";
    return amount + " " + this.paramService.symbolCurrency();
  }

  // génère le nom du fichier feuille jaune dans la devise @devise
  private createFJName(fj_o, devise) {
    let initiales = fj_o.personne.split(' ').map(mot => mot[0].toUpperCase()).join('')
    let date = moment(fj_o.month, 'YYYY-MM-DD').format('YYMM')
    return `FeuilleJaune_${initiales}_${date}_${devise}.pdf`
  }

  async coolWrite(path, filename, blob) {
    let exists = false
    try {
      exists = await this.file.checkFile(path, filename)
    } catch(e) {
      console.log("Impossible de vérifier l'existence du fichier " + path + "/" + filename)
      return this.file.writeFile(path, filename, blob, {replace:true})
    }
    
    if (exists) {
      await this.file.removeFile(path, filename)
      return this.file.writeFile(path, filename, blob, {replace:true})
    }
    return this.file.writeFile(path, filename, blob, {replace:true})
  }

  coolWrite_old(path, filename, blob) {
    /* // TODO remove this function
    return new Promise((resolve, reject) => {
      this.file.checkFile(path, filename).then(exists => {
        if (exists) {
          this.file.removeFile(path, filename).then(res => {
            this.file.writeFile(path, filename, blob, {replace:true}).then(res => {
              resolve(res)
            }).catch(err => {
              reject(err)
            });
          }).catch(err => {
            console.log("Error removing existing file at " + path + "/" + filename);
            reject(err)
          })
        } else {
          this.file.writeFile(path, filename, blob, {replace:true}).then(res => {
            resolve(res)
          }).catch(err => {
            reject(err)
          });
        }
      }).catch(err => {
        console.log("Impossible de vérifier l'existence du fichier " + path + "/" + filename)
        this.file.writeFile(path, filename, blob, {replace:true}).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        });
      });
    }); */
  }

  async createFJPDF(fj_o) {
    let dir_path = this.file.dataDirectory;
    let results = {
      personne: fj_o.personne,
      month: fj_o.month,
      dir: dir_path,
      files: []
    }
    
    for (let currency in fj_o.data) {
      let filename = this.createFJName(fj_o, currency)

      let pdf_data = null
      try {
        pdf_data = await this.createPdf(fj_o, currency)
      } catch(e) {
        throw {
          fun: 'ERROR in pdf.service > createFJPDF > createPdf',
          e
        }
      }
      let blob = new Blob([pdf_data], { type: 'application/pdf' });
      
      results.files.push({filename, blob})
    }
    return results
  }

  createFJ_old(fjdata, opt) {
    /* // TODO remove this function
    // on gère les paramètres par défaut
    opt = this.manageDefaults(opt);

    // this.fjdata = this.fjdata_test;
    return new Promise((resolve, reject) => {
      this.createPdf(fjdata, opt).then((pdf) => {
        let blob = new Blob([pdf], { type: 'application/pdf' });
        this.file.checkFile(opt.path, opt.filename).then(exists => {
          if (exists) {
            this.file.removeFile(opt.path, opt.filename).then(res => {
              console.log("File remove : ", res);
              this.shareFJ(blob, opt).then(msg => {
                resolve(msg)
              }).catch(err => {
                reject(err)
              });
            }).catch(err => {
              console.log("Error removing existing pdf file at " + opt.path + "/" + opt.filename)
            })
          } else {
            this.shareFJ(blob, opt).then(msg => {
              resolve(msg)
            }).catch(err => {
              reject(err)
            });
          }
        }).catch(err => {
          if (err.code == 1) {
            this.shareFJ(blob, opt).then(msg => {
              resolve(msg)
            }).catch(err => {
              reject(err)
            });
          } else {
            console.log("Impossible checkFile of " + opt.path + "/" + opt.filename + ", trying direct download...", err);
            this.pdf_url = URL.createObjectURL(blob);
            this.downloadBrowser(this.pdf_url, opt);
            resolve("Trying to download directly from the browser...")
          }
        });
      }).catch(err => {
        console.log("Error creating pdf blob : ", err);
      })
    }) */
  }

  // pdf_paths_o est un objet retourné par createFJPDF
  async shareFJ(pdf_paths_o) {
    console.log('pdf.service > shareFJ', pdf_paths_o)

    if (this.weAreInBrowser()) {
      console.log("Trying to download PDF directly...");
      for (let file_o of pdf_paths_o.files) {
        let pdf_url = URL.createObjectURL(file_o.blob);
        this.downloadBrowser(pdf_url, file_o);
        return `Trying to download PDF ${file_o.filename} directly...`
      }
    } else {
      return this.shareFJ_android(pdf_paths_o)
    }
  }

  async shareFJ_android(pdf_paths_o) {
    let sujet = "Feuille Jaune - " + pdf_paths_o.personne + " - mois de " + moment(pdf_paths_o.month).format("MMMM - YYYY");
    let paths = []
      for (let file_o of pdf_paths_o.files) {
        await this.coolWrite(pdf_paths_o.dir, file_o.filename, file_o.blob)
        paths.push(pdf_paths_o.dir + "/" + file_o.filename)
      }

      try {
        await this.socialSharing.share("", sujet, paths)
      } catch(err) {
        if (err === false) {
          let toast = this.toastCtrl.create({
            message: "Feuille Jaune exportée ! Merci Seigneur de prendre soin de nous !",
            duration: 2000
          });
          toast.present();
          return 2
        } else {
          console.log('ERROR in pdf.service > shareFJ > socialSharing.share', err)
          let toast = this.toastCtrl.create({
            message: "Erreur pendant l'export de la Feuille Jaune : " + JSON.stringify(err),
            duration: 2000
          });
          toast.present();
          throw "Erreur pendant l'export de la Feuille Jaune : " + JSON.stringify(err)
        }
      }
  }

  weAreInBrowser() {
    return this.ptfm.is('mobileweb') || this.ptfm.is('core')
  }

  public shareFJ_old(blob, opt) {
    // TODO delete this function
    // on gère les paramètres par défaut
    /* opt = this.manageDefaults(opt);

    return new Promise((resolve, reject) => {
      // this.file.writeFile(opt.path, opt.filename, blob, true).then(_ => {
      this.coolWrite(opt.path, opt.filename, blob).then(_ => {
        console.log("PDF file written in : " + opt.path + "/" + opt.filename);
        let sujet = "Feuille Jaune - " + opt.personne + " - mois de " + moment(opt.curr_month).format("MMMM - YYYY");
        this.socialSharing.share("", sujet, opt.path + "/" + opt.filename).then(e => {
          console.log("PDF sharing ok", e);
          resolve(1);
        }).catch(err => {
          if (err === false) {
            let toast = this.toastCtrl.create({
              message: "Feuille Jaune exportée ! Merci Seigneur de prendre soin de nous !",
              duration: 2000
            });
            toast.present();
            resolve(2);
          } else {
            console.log(err)
            let toast = this.toastCtrl.create({
              message: "Erreur pendant l'export de la Feuille Jaune : " + JSON.stringify(err),
              duration: 2000
            });
            toast.present();
            reject("Erreur pendant l'export de la Feuille Jaune : " + JSON.stringify(err));
          }
        });
      }).catch(err => {
        console.log("Failed writing PDF file : ", err);
        console.log("Trying to download PDF directly...");
        this.pdf_url = URL.createObjectURL(blob);
        this.downloadBrowser(this.pdf_url, opt);
        resolve("Trying to download PDF directly...")
      })
    }) */
  }

  public createPdf(fjdata, currency) {
    return new Promise((resolve, reject) => {
      let dd = this.createDocumentDefinition(fjdata, currency);
      let pdf = pdfMake.createPdf(dd);

      pdf.getBase64((output) => {
        if (!output) console.log("PDF Base64 output is empty :(");
        else resolve(this.base64ToUint8Array(output));
      });
    })
  }

  downloadBrowser(data, file_o) {
    var element = document.createElement('a');
    // element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('href', data);
    element.setAttribute('download', file_o.filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  private base64ToUint8Array(base64) {
    var raw = atob(base64);
    var uint8Array = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) {
      uint8Array[i] = raw.charCodeAt(i);
    }
    return uint8Array;
  }

  private createDDBody(fj_o, currency) {
    // important : on définit fjdata.transfert.caisse uniquement maintenant, pour la génération du pdf
    fj_o.data[currency].transfert.caisse = -fj_o.data[currency].transfert.banque;

    // on prépare les données
    let data = {}
    for (let categorie in fj_o.data[currency]) {
      if (categorie != 'soustotaux') {
        data[categorie] = {
          label: this.paramService.getCatLabel(categorie),
          banque: this.prettyCurrency(fj_o.data[currency][categorie].banque),
          caisse: this.prettyCurrency(fj_o.data[currency][categorie].caisse),
          observations: fj_o.data[currency][categorie].observations
        }
      } else {
        data[categorie] = JSON.parse(JSON.stringify(fj_o.data[currency][categorie]))
      }
    }

    data['soustotaux']['total']['bc'] = this.prettyCurrency(fj_o.data[currency]['soustotaux']['total'].banque + fj_o.data[currency]['soustotaux']['total'].caisse)
    data['soustotaux']['solde']['bc'] = this.prettyCurrency(fj_o.data[currency]['soustotaux']['solde'].banque + fj_o.data[currency]['soustotaux']['solde'].caisse)

    let line_nums = [];
    let body = [];
    body.push([{ text: '1', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'NOM: ' + fj_o.personne + '  -  MOIS: ' + moment(fj_o.month, 'YYYY-MM-DD').format('MM-YYYY'), style: "defaultStyle" }, { text: 'BANQUE', alignment: 'center', style: "defaultStyle" }, { text: 'CAISSE', alignment: 'center', style: 'defaultStyle' }, { text: 'OBSERVATIONS', style: 'defaultStyle' }]);

    // ENTREES
    body.push([{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { 'text': 'ENTRÉES', style: ["header"] }, '', '', { text: 'Maison: ' + fj_o.maison, margin: [0, 0, 0, 0], fontSize: 9 }]);
    ['salaire', 'allocation', 'don'].forEach((el, i) => {
      body.push([{ text: (i + 2).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: data[el].label, style: ['categorie'] }, { text: data[el].banque, style: 'montant' }, { text: data[el].caisse, style: 'montant' }, { text: data[el].observations, style: 'observation' }])
    });
    body.push([{ text: '5', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'SOUS-TOTAL', style: ['section'] }, { text: data['soustotaux'].revenus.banque, style: ['montantImp'] }, { text: data['soustotaux'].revenus.caisse, style: ['montantImp'] }, { text: '', style: 'observation' }]);
    line_nums = ['6', '7', '8', '9', '10', '12', '13'];
    ['dime', 'autre', 'remboursement_sante', 'remboursement_pro', 'remboursement_autre'].forEach((el, i) => {
      body.push([{ text: line_nums[i], style: 'line_num' }, { text: '', style: 'col_space' }, { text: data[el].label, style: ['categorie'] }, { text: data[el].banque, style: 'montant' }, { text: data[el].caisse, style: 'montant' }, { text: data[el].observations, style: 'observation' }])
    });
    body.push([{ text: '12', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'REPORT DU MOIS PRÉCÉDENT', style: 'report' }, { text: data['report_mois_precedent'].banque, style: 'montantImp' }, { text: data['report_mois_precedent'].caisse, style: 'montantImp' }, { text: data['report_mois_precedent'].observations, style: 'observation' }])
    body.push([{ text: '13', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Avance demandée à la MM ou à la Cté', style: ['categorie'] }, { text: data['avance'].banque, style: 'montant' }, { text: data['avance'].caisse, style: 'montant' }, { text: data['avance'].observations, style: 'observation' }]);
    body.push([{ text: '14', style: 'line_num' }, { text: '', style: 'col_space' }, { text: '', style: ['categorie'] }, { text: '', style: 'montant' }, { text: '', style: 'montant' }, { text: '', style: 'observation' }]);
    line_nums = ['15', '16'];
    ['epargne', 'transfert'].forEach((el, i) => {
      body.push([{ text: line_nums[i], style: 'line_num' }, { text: '', style: 'col_space' }, { text: data[el].label, style: ['categorie'] }, { text: data[el].banque, style: 'montant' }, { text: data[el].caisse, style: 'montant' }, { text: data[el].observations, style: 'observation' }])
    });
    body.push([{ text: '17', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'I - DISPONIBILITÉS DU MOIS', style: ['subsection'] }, { text: data['soustotaux']['dispos_mois'].banque, style: 'montantImp' }, { text: data['soustotaux']['dispos_mois'].caisse, style: 'montantImp' }, { text: '', style: 'observation' }]);

    // SORTIES
    // SOUS-TOTAL MAISON
    body.push([{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { 'text': 'SORTIES', style: ["header"] }, '', '', { text: '', margin: [0, 5, 0, 5] }]);
    line_nums = ['18', '19', '21', '22', '23', '24', '25', '29', '30'];
    this.paramService.liste_maison.forEach((el, i) => {
      body.push([{ text: line_nums[i], style: 'line_num' }, { text: '', style: 'col_space' }, { text: data[el].label, style: ['categorie'] }, { text: data[el].banque, style: 'montant' }, { text: data[el].caisse, style: 'montant' }, { text: data[el].observations, style: 'observation' }])
    });
    body.push([{ text: '', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'II - TOTAL MAISON', style: ['subsection'] }, { text: data['soustotaux']['maison'].banque, style: 'montantImp' }, { text: data['soustotaux']['maison'].caisse, style: 'montantImp' }, { text: '', style: 'observation' }]);

    // SOUS-TOTAL VIE COURANTE
    this.paramService.liste_viecourante.forEach((el, i) => {
      body.push([{ text: (i + 32).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: data[el].label, style: ['categorie'] }, { text: data[el].banque, style: 'montant' }, { text: data[el].caisse, style: 'montant' }, { text: data[el].observations, style: 'observation' }])
    });
    body.push([{ text: '44', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'III - TOTAL VIE COURANTE', style: ['subsection'] }, { text: data['soustotaux']['vie_courante'].banque, style: 'montantImp' }, { text: data['soustotaux']['vie_courante'].caisse, style: 'montantImp' }, { text: '', style: 'observation' }]);

    // SOUS-TOTAL TRANSPORT
    this.paramService.liste_transport.forEach((el, i) => {
      body.push([{ text: (i + 45).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: data[el].label, style: ['categorie'] }, { text: data[el].banque, style: 'montant' }, { text: data[el].caisse, style: 'montant' }, { text: data[el].observations, style: 'observation' }])
    });
    body.push([{ text: '52', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'IV - TOTAL TRANSPORT', style: ['subsection'] }, { text: data['soustotaux']['transport'].banque, style: 'montantImp' }, { text: data['soustotaux']['transport'].caisse, style: 'montantImp' }, { text: '', style: 'observation' }]);

    // SOUS-TOTAL SECRETARIAT
    this.paramService.liste_secretariat.forEach((el, i) => {
      body.push([{ text: (i + 54).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: data[el].label, style: ['categorie'] }, { text: data[el].banque, style: 'montant' }, { text: data[el].caisse, style: 'montant' }, { text: data[el].observations, style: 'observation' }])
    });
    body.push([{ text: '57', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'V - TOTAL SECRÉTARIAT', style: ['subsection'] }, { text: data['soustotaux']['secretariat'].banque, style: 'montantImp' }, { text: data['soustotaux']['secretariat'].caisse, style: 'montantImp' }, { text: '', style: 'observation' }]);

    // BANQUE
    ['perte', 'frais_banque'].forEach((el, i) => {
      body.push([{ text: (i + 58).toString(), style: 'line_num' }, { text: '', style: 'col_space' }, { text: data[el].label, style: ['categorie'] }, { text: data[el].banque, style: 'montant' }, { text: data[el].caisse, style: 'montant' }, { text: data[el].observations, style: 'observation' }])
    });
    body.push([{ text: '61', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'Avance retournée ou solde feuille jaune', style: ['categorie'] }, { text: data['avance_retournee'].banque, style: 'montant' }, { text: data['avance_retournee'].caisse, style: 'montant' }, { text: 'TOTAL BANQUE + CAISSE', style: 'total_banque_caisse' }]);

    body.push([{ text: '62', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'TOTAL DES SORTIES', style: 'total_sorties' }, { text: data['soustotaux']['total'].banque, style: 'montantImp' }, { text: data['soustotaux']['total'].caisse, style: 'montantImp' }, { text: data['soustotaux']['total'].bc, style: 'montantImp' }]);
    body.push([{ text: '63', style: 'line_num' }, { text: '', style: 'col_space' }, { text: 'SOLDE (à reporter le mois suivant ligne 12)', style: 'solde' }, { text: data['soustotaux']['solde'].banque, style: 'montant' }, { text: data['soustotaux']['solde'].caisse, style: 'montant' }, { text: data['soustotaux']['solde'].bc, style: 'montant' }]);
 
    console.log("BODY PDF", body)
    return body
  }

  private createDocumentDefinition(fjdata, currency) {
    let body = {}
    try {
      body = this.createDDBody(fjdata, currency)
    } catch(e) {
      throw {
        fun: 'ERROR in pdf.service > createDDBody',
        err: e
      }
    }

    let dd = {
      pageSize: 'A4',
      info: {
        title: "Feuille Jaune"
      },
      pageMargins: [40, 20, 40, 20],
      content: [
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: [14, 2, '*', 60, 60, 120],

            body,
          },
          layout: {
            hLineWidth: function(i, node) {
              return (i === 2 || i === 18 || i == 56) ? 2 : 1;
            },
            vLineWidth: function(i, node) {
              return (i === 0 || i == 3 || i == 4 || i == 5 || i === node.table.widths.length) ? 1 : 0;
            },
            hLineColor: function(i, node) {
              return (i === 2 || i === 18 || i == 56) ? 'black' : 'gray';
            },
            vLineColor: function(i, node) {
              return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
            },
            // paddingLeft: function(i, node) { return 4; },
            // paddingRight: function(i, node) { return 4; },
            // paddingTop: function(i, node) { return 2; },
            // paddingBottom: function(i, node) { return 2; },
            // fillColor: function (i, node) { return null; }
          }
        },
      ],
      styles: {
        header: {
          fontSize: 9,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 0]
        },
        report: {
          bold: true,
          fontSize: 8
        },
        section: {
          alignment: 'center',
          border: [false, false, false, false],
          fontSize: 8
        },
        subsection: {
          alignment: 'right',
          bold: true,
          fontSize: 8
        },
        line_num: {
          fontSize: 7
        },
        montant: {
          alignment: 'right',
          fontSize: 7
        },
        montantImp: {
          fillColor: '#DDDDDD',
          alignment: 'right',
          fontSize: 7
        },
        observation: {
          fontSize: 7
        },
        categorie: {
          fontSize: 7
        },
        total_banque_caisse: {
          fillColor: '#DDDDDD',
          bold: true,
          fontSize: 7
        },
        total_sorties: {
          alignment: 'right',
          fontSize: 8,
          bold: true,
          fillColor: '#DDDDDD'
        },
        solde: {
          fontSize: 8,
          bold: true,
          alignment: 'right'
        },
        defaultStyle: {
          fontSize: 9
        }
      }
    }

    return dd;
  }

}
