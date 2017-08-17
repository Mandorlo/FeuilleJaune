import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { HomePage } from '../pages/home/home';
import { Ajouter2Page } from '../pages/ajouter2/ajouter2';
import { BudgetPage } from '../pages/budget/budget';
import { ChartsPage } from '../pages/charts/charts';
import { ParamPage } from '../pages/param/param';
import { FeuillejaunePage } from '../pages/feuillejaune/feuillejaune';
import { FjgenPage } from '../pages/fjgen/fjgen';
import { FjmgmtPage } from '../pages/fjmgmt/fjmgmt';
import { FjactionsPage } from '../pages/fjactions/fjactions';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';
import { FileChooser } from '@ionic-native/file-chooser';
import { IonicStorageModule } from '@ionic/storage';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Diagnostic } from '@ionic-native/diagnostic';
import { AppVersion } from '@ionic-native/app-version';

import { TransactionService } from '../services/transaction.service';
import { ParamService } from '../services/param.service';
import { PdfService } from '../services/pdf.service';
import { FjService } from '../services/fj.service';
import { ExportService } from '../services/export.service';

import { DatePicker } from '@ionic-native/date-picker';
import { BudgetLineComponent } from '../components/budget-line/budget-line';
import { FjLineComponent } from '../components/fj-line/fj-line';
import { FjcircleComponent } from '../components/fjcircle/fjcircle';
import { ProgressBarComponent } from '../components/progress-bar/progress-bar';
import { RadioSquareComponent } from '../components/radio-square/radio-square';

import { CurrencyPipe } from '../pipes/currency';
import { GaugeComponent } from '../components/gauge/gauge';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    Ajouter2Page,
    BudgetPage,
    ChartsPage,
    ParamPage,
    FeuillejaunePage,
    FjgenPage,
    FjmgmtPage,
    FjactionsPage,
    TabsPage,
    BudgetLineComponent,
    FjLineComponent,
    ProgressBarComponent,
    RadioSquareComponent,
    CurrencyPipe,
    FjcircleComponent,
    GaugeComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    Ajouter2Page,
    BudgetPage,
    ChartsPage,
    ParamPage,
    FeuillejaunePage,
    FjgenPage,
    FjmgmtPage,
    FjactionsPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    File,
    SocialSharing,
    FileChooser,
    TransactionService,
    ParamService,
    PdfService,
    FjService,
    ExportService,
    DatePicker,
    AndroidPermissions,
    Diagnostic,
    AppVersion
  ]
})
export class AppModule {}
