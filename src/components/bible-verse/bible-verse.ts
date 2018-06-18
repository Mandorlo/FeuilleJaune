import { Component } from '@angular/core';

/**
 * Generated class for the BibleVerseComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'bible-verse',
  templateUrl: 'bible-verse.html'
})
export class BibleVerseComponent {

  private bible_verses = [{
    'ref': 'Matthieu 6, 21',
    'text': 'Car là où est ton trésor, là aussi sera ton cœur.'
  }, {
    'ref': 'Malachie 3, 10',
    'text': 'Apportez toute la dîme à la maison du trésor, pour qu’il y ait de la nourriture dans ma Maison. Soumettez-moi donc ainsi à l’épreuve, – dit le Seigneur de l’univers –, et vous verrez si je n’ouvre pas pour vous les écluses du ciel si je ne répands pas sur vous la bénédiction en abondance !'
  }, {
    'ref': 'Ecclésiaste 5, 10',
    'text': "Celui qui aime l'argent n'est pas rassasié par l'argent, et celui qui aime les richesses n'en profite pas. C'est encore là une vanité."
  }, {
    'ref': 'Romains 13, 8',
    'text': "N’ayez de dette envers personne, sauf celle de l’amour mutuel, car celui qui aime les autres a pleinement accompli la Loi."
  }, {
    'ref': 'Psaume 36 (37), 16-17',
    'text': "Pour le juste, avoir peu de biens vaut mieux que la fortune des impies. Car le bras de l'impie sera brisé, mais le Seigneur soutient les justes."
  }, {
    'ref': 'Proverbes 13, 11',
    'text': "Fortune trop soudaine s’évanouira ; qui amasse peu à peu la verra grossir."
  }, {
    'ref': 'Hébreux 13, 5',
    'text': "Que votre conduite ne soit pas inspirée par l’amour de l’argent : contentez-vous de ce que vous avez, car Dieu lui-même a dit : Jamais je ne te lâcherai, jamais je ne t’abandonnerai."
  }, {
    'ref': 'Matthieu 19, 21',
    'text': "Jésus lui répondit : « Si tu veux être parfait, va, vends ce que tu possèdes, donne-le aux pauvres, et tu auras un trésor dans les cieux. Puis viens, suis-moi. »"
  }, {
    'ref': 'Proverbes 17, 16',
    'text': "À quoi bon de l’argent dans la main d’un insensé ? Pour acheter la sagesse ? Il n’a rien dans la tête !"
  }, {
    'ref': 'Matthieu 6, 24',
    'text': "Nul ne peut servir deux maîtres : ou bien il haïra l’un et aimera l’autre, ou bien il s’attachera à l’un et méprisera l’autre. Vous ne pouvez pas servir à la fois Dieu et l’Argent."
  }, {
    'ref': 'Luc 3, 14',
    'text': "Des soldats lui demandèrent à leur tour : « Et nous, que devons-nous faire ? » Il leur répondit : « Ne faites violence à personne, n’accusez personne à tort ; et contentez-vous de votre solde. »"
  }, {
    'ref': "Exode 23, 25",
    'text': "Si tu prends en gage le manteau de ton prochain, tu le lui rendras avant le coucher du soleil."
  }, {
    'ref': '1 Timothée 6, 10',
    'text': "Car la racine de tous les maux, c’est l’amour de l’argent. Pour s’y être attachés, certains se sont égarés loin de la foi et se sont infligé à eux-mêmes des tourments sans nombre."
  }, {
    'ref': 'Matthieu 21, 12-13',
    'text': "Jésus entra dans le Temple, et il expulsa tous ceux qui vendaient et achetaient dans le Temple ; il renversa les comptoirs des changeurs et les sièges des marchands de colombes. Il leur dit : « Il est écrit : Ma maison sera appelée maison de prière. Or vous, vous en faites une caverne de bandits. »"
  }, {
    'ref': '1 Timothée 6, 17-19',
    'text': "Quant aux riches de ce monde, ordonne-leur de ne pas céder à l’orgueil. Qu’ils mettent leur espérance non pas dans des richesses incertaines, mais en Dieu qui nous procure tout en abondance pour que nous en profitions. Qu’ils fassent du bien et deviennent riches du bien qu’ils font ; qu’ils donnent de bon cœur et sachent partager. De cette manière, ils amasseront un trésor pour bien construire leur avenir et obtenir la vraie vie."
  }, {
    'ref': 'Luc 12, 33',
    'text': "Vendez ce que vous possédez et donnez-le en aumône. Faites-vous des bourses qui ne s’usent pas, un trésor inépuisable dans les cieux, là où le voleur n’approche pas, où la mite ne détruit pas."
  }, {
    'ref': 'Deutéronome 15, 7-8',
    'text': "Se trouve-t-il chez toi un malheureux parmi tes frères, dans l’une des villes de ton pays que le Seigneur ton Dieu te donne ? Tu n’endurciras pas ton cœur, tu ne fermeras pas la main à ton frère malheureux, mais tu lui ouvriras tout grand la main et lui prêteras largement de quoi suffire à ses besoins."
  }, {
    'ref': 'Matthieu 6, 1-4',
    "text": "Ce que vous faites pour devenir des justes, évitez de l’accomplir devant les hommes pour vous faire remarquer. Sinon, il n’y a pas de récompense pour vous auprès de votre Père qui est aux cieux. Ainsi, quand tu fais l’aumône, ne fais pas sonner la trompette devant toi, comme les hypocrites qui se donnent en spectacle dans les synagogues et dans les rues, pour obtenir la gloire qui vient des hommes. Amen, je vous le déclare : ceux-là ont reçu leur récompense. Mais toi, quand tu fais l’aumône, que ta main gauche ignore ce que fait ta main droite, afin que ton aumône reste dans le secret ; ton Père qui voit dans le secret te le rendra."
  }, {
    'ref': 'Actes 8, 18-20',
    "text": "Simon, voyant que l’Esprit était donné par l’imposition des mains des Apôtres, leur offrit de l’argent en disant : « Donnez-moi ce pouvoir, à moi aussi, pour que tous ceux à qui j’imposerai les mains reçoivent l’Esprit Saint. » Pierre lui dit : « Périsse ton argent, et toi avec, puisque tu as estimé pouvoir acheter le don de Dieu à prix d’argent !"
  }, {
    'ref': 'Marc 12, 41-44',
    "text": " Jésus s’était assis dans le Temple en face de la salle du trésor, et regardait comment la foule y mettait de l’argent. Beaucoup de riches y mettaient de grosses sommes. Une pauvre veuve s’avança et mit deux petites pièces de monnaie. Jésus appela ses disciples et leur déclara : « Amen, je vous le dis : cette pauvre veuve a mis dans le Trésor plus que tous les autres. Car tous, ils ont pris sur leur superflu, mais elle, elle a pris sur son indigence : elle a mis tout ce qu’elle possédait, tout ce qu’elle avait pour vivre. »"
  }, {
    'ref': 'Apocalypse 3, 17',
    "text": "Tu dis : « Je suis riche, je me suis enrichi, je ne manque de rien », et tu ne sais pas que tu es malheureux, pitoyable, pauvre, aveugle et nu !"
  }, {
    'ref': 'Luc 14, 28',
    "text": "Quel est celui d’entre vous qui, voulant bâtir une tour, ne commence par s’asseoir pour calculer la dépense et voir s’il a de quoi aller jusqu’au bout ?"
  }, {
    'ref': 'Luc 16, 13-15',
    "text": "Aucun domestique ne peut servir deux maîtres : ou bien il haïra l’un et aimera l’autre, ou bien il s’attachera à l’un et méprisera l’autre. Vous ne pouvez pas servir à la fois Dieu et l’argent. » Quand ils entendaient tout cela, les pharisiens, eux qui aimaient l’argent, tournaient Jésus en dérision. Il leur dit alors : « Vous, vous êtes de ceux qui se font passer pour justes aux yeux des gens, mais Dieu connaît vos cœurs ; en effet, ce qui est prestigieux pour les gens est une chose abominable aux yeux de Dieu."
  }, {
    'ref': "Actes 4, 34-35",
    "text": "Aucun d’entre eux n’était dans l’indigence, car tous ceux qui étaient propriétaires de domaines ou de maisons les vendaient, et ils apportaient le montant de la vente pour le déposer aux pieds des Apôtres ; puis on le distribuait en fonction des besoins de chacun."
  }, {
    'ref': "2 Chroniques 1, 11-12",
    "text": "Dieu répondit à Salomon : « Puisque c’est cela que tu as pris à cœur et que tu ne m’as demandé ni richesse, ni biens, ni gloire, ni la vie de tes ennemis, puisque tu ne m’as pas demandé non plus de longs jours, mais que tu as demandé pour toi sagesse et connaissance, afin de gouverner mon peuple sur lequel je te fais roi, la sagesse et la connaissance te sont données. Je te donnerai aussi la richesse, les biens et la gloire, comme aucun roi n’en a eu avant toi et comme aucun n’en aura après toi. »"
  }, {
    'ref': "Deutéronome 28, 12",
    "text": "Le Seigneur ouvrira pour toi son beau trésor, le ciel pour donner la pluie à ton pays au temps favorable et bénir ainsi toute œuvre de ta main. Tu prêteras à beaucoup de nations, et toi, tu n’emprunteras pas."
  }, {
    'ref': "MAtthieu 13, 44",
    "text": "Le royaume des Cieux est comparable à un trésor caché dans un champ ; l’homme qui l’a découvert le cache de nouveau. Dans sa joie, il va vendre tout ce qu’il possède, et il achète ce champ."
  }, {
    'ref': "1 Samuel 2, 7",
    "text": "le Seigneur rend pauvre et riche ; il abaisse et il élève."
  }, {
    'ref': "Proverbes 3, 9-10",
    "text": "Rends gloire au Seigneur avec tes biens, donne-lui les prémices de ton revenu : tes greniers se rempliront de blé, le vin nouveau débordera de tes cuves."
  }]

  text: string;
  private verse;

  constructor() {
    console.log('Hello BibleVerseComponent Component');
    this.text = 'Béni soit le Seigneur !';
    this.randomVerse()
  }

  ionViewDidEnter() {
    console.log('entered ! Grazie Signore !')
    this.randomVerse()
  }

  randomVerse() {
    let n = Math.round(Math.random() * (this.bible_verses.length -1))
    this.verse = this.bible_verses[n]
  }

}
