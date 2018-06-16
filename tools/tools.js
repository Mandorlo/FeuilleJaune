const admin = require('firebase-admin');
const MAISONS = require('./maisons.json')
const CURRENCIES = require('./currencies.json')
const SMART_CATEGORIES = require('./smart_categories.json')

const collections = {
	'maisons': MAISONS,
	'currencies': CURRENCIES,
	'smart_categories': SMART_CATEGORIES
}

const ids = {
	'maisons': 'trig',
	'currencies': 'id'
}

var serviceAccount = require('../src/arcana/FJ_service_account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();

// db.collection('maisons').get()
	// .then((snapshot) => {
	  // snapshot.forEach((doc) => {
		// console.log(doc.id, '=>', doc.data());
	  // });
	// })
// .catch((err) => {
	// console.log('Error getting documents', err);
// });

function uploadCollection(coll_name) {
	
	let plist = []
	let i = 1
	for (let el of collections[coll_name]) {
		let id = (ids[coll_name]) ? el[ids[coll_name]] : 'id_' + i;
		let docRef = db.collection(coll_name).doc(id);
		plist.push(docRef.set(el))
		i++
	}
	return Promise.all(plist)
}

uploadCollection('smart_categories').then(res => console.log(res)).catch(err => console.log(err))