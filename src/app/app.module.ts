import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { firebaseConfig } from '../arcana/firebase_config'
import { AngularFirestoreModule } from 'angularfire2/firestore';

import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TooltipsModule } from 'ionic-tooltips';

import { HomePage } from '../pages/home/home';
import { Ajouter2Page } from '../pages/ajouter2/ajouter2';
import { BudgetPage } from '../pages/budget/budget';
import { TrDetailsPage } from '../pages/tr-details/tr-details';
import { ChartsPage } from '../pages/charts/charts';
import { ParamPage } from '../pages/param/param';
//import { FeuillejaunePage } from '../pages/feuillejaune/feuillejaune';
import { FjgenPage } from '../pages/fjgen/fjgen';
import { FjObservationsPage } from '../pages/fj-observations/fj-observations';
import { FjDetailsPage } from '../pages/fj-details/fj-details';
import { FjmgmtPage } from '../pages/fjmgmt/fjmgmt';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file';
import { SocialSharing } from '@ionic-native/social-sharing';
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path';
import { IonicStorageModule } from '@ionic/storage';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Diagnostic } from '@ionic-native/diagnostic';
import { AppVersion } from '@ionic-native/app-version';

import { TransactionService } from '../services/transaction.service';
import { ParamService } from '../services/param.service';
import { PdfService } from '../services/pdf.service';
import { FjService } from '../services/fj.service';
import { ExportService } from '../services/export.service';
import { CurrencyService } from '../services/currency.service';
import { PhotoService } from '../services/photo.service';
import { StatsService } from '../services/stats.service';

import { DatePicker } from '@ionic-native/date-picker';
import { BudgetLineComponent } from '../components/budget-line/budget-line';
import { FjLineComponent } from '../components/fj-line/fj-line';
import { FjcircleComponent } from '../components/fjcircle/fjcircle';
import { ProgressBarComponent } from '../components/progress-bar/progress-bar';
import { RadioSquareComponent } from '../components/radio-square/radio-square';
import { BibleVerseComponent } from '../components/bible-verse/bible-verse';

import { CurrencyPipe } from '../pipes/currency';
import { HistoFilter } from '../pipes/histoFilter'
//import { GaugeComponent } from '../components/gauge/gauge';
import { FilterOptionsComponent } from '../components/filter-options/filter-options';
import { RevealDivComponent } from '../components/reveal-div/reveal-div';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    Ajouter2Page,
    BudgetPage,
    TrDetailsPage,
    ChartsPage,
    ParamPage,
    //FeuillejaunePage,
    FjgenPage,
    FjObservationsPage,
    FjDetailsPage,
    FjmgmtPage,
    TabsPage,
    BudgetLineComponent,
    FjLineComponent,
    ProgressBarComponent,
    RadioSquareComponent,
    BibleVerseComponent,
    CurrencyPipe,
    HistoFilter,
    FjcircleComponent,
    //GaugeComponent,
    FilterOptionsComponent,
    RevealDivComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    TooltipsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    Ajouter2Page,
    BudgetPage,
    TrDetailsPage,
    ChartsPage,
    ParamPage,
    //FeuillejaunePage,
    FjgenPage,
    FjObservationsPage,
    FjDetailsPage,
    FjmgmtPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    File,
    SocialSharing,
    FileChooser,
    FilePath,
    TransactionService,
    ParamService,
    PdfService,
    FjService,
    ExportService,
    CurrencyService,
    PhotoService,
    StatsService,
    DatePicker,
    AndroidPermissions,
    Diagnostic,
    AppVersion,
    FjObservationsPage
  ]
})
export class AppModule {}
