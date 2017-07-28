import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { AjouterPage } from '../pages/ajouter/ajouter';
import { Ajouter2Page } from '../pages/ajouter2/ajouter2';
import { BudgetPage } from '../pages/budget/budget';
import { ParamPage } from '../pages/param/param';
import { FeuillejaunePage } from '../pages/feuillejaune/feuillejaune';
import { FjgenPage } from '../pages/fjgen/fjgen';
import { FjmgmtPage } from '../pages/fjmgmt/fjmgmt';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';
import { IonicStorageModule } from '@ionic/storage';

import { TransactionService } from '../services/transaction.service';
import { ParamService } from '../services/param.service';
import { PdfService } from '../services/pdf.service';
import { FjService } from '../services/fj.service';

import { DatePicker } from '@ionic-native/date-picker';
import { BudgetLineComponent } from '../components/budget-line/budget-line';
import { FjLineComponent } from '../components/fj-line/fj-line';
import { ProgressBarComponent } from '../components/progress-bar/progress-bar';
import { RadioSquareComponent } from '../components/radio-square/radio-square';

import { CurrencyPipe } from '../pipes/currency';
import { FjcircleComponent } from '../components/fjcircle/fjcircle';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    AjouterPage,
    Ajouter2Page,
    BudgetPage,
    ParamPage,
    FeuillejaunePage,
    FjgenPage,
    FjmgmtPage,
    TabsPage,
    BudgetLineComponent,
    FjLineComponent,
    ProgressBarComponent,
    RadioSquareComponent,
    CurrencyPipe,
    FjcircleComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    AjouterPage,
    Ajouter2Page,
    BudgetPage,
    ParamPage,
    FeuillejaunePage,
    FjgenPage,
    FjmgmtPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    File,
    SocialSharing,
    TransactionService,
    ParamService,
    PdfService,
    FjService,
    DatePicker
  ]
})
export class AppModule {}
