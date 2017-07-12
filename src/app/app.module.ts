import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { TabsPage } from '../pages/tabs/tabs';
import { AjouterPage } from '../pages/ajouter/ajouter';
import { Ajouter2Page } from '../pages/ajouter2/ajouter2';
import { BudgetPage } from '../pages/budget/budget';
import { DetailsPage } from '../pages/details/details';
import { FeuillejaunePage } from '../pages/feuillejaune/feuillejaune';
import { ParamPage } from '../pages/param/param';

import { TransactionService } from '../services/transaction.service';
import { PdfService } from '../services/pdf.service';
import { ParamService } from '../services/param.service';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { DatePicker } from '@ionic-native/date-picker';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';

import { FjLineComponent } from '../components/fj-line/fj-line';
import { BudgetLineComponent } from '../components/budget-line/budget-line';
import { RadioSquareComponent } from '../components/radio-square/radio-square';
import { ProgressBarComponent } from '../components/progress-bar/progress-bar';

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    AjouterPage,
    Ajouter2Page,
    BudgetPage,
    DetailsPage,
    ParamPage,
    FeuillejaunePage,
    FjLineComponent,
    BudgetLineComponent,
    RadioSquareComponent,
    ProgressBarComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    AjouterPage,
    Ajouter2Page,
    BudgetPage,
    DetailsPage,
    FeuillejaunePage,
    ParamPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    TransactionService,
    PdfService,
    ParamService,
    DatePicker,
    File,
    SocialSharing
  ]
})
export class AppModule { }
