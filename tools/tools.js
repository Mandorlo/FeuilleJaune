const fs = require('fs')
const admin = require('firebase-admin');
const MAISONS = require('./maisons.json')
let CURRENCIES = require('./currencies.json')
const SMART_CATEGORIES = require('./smart_categories.json')
const client = require('node-rest-client-promise');

let serviceAccount = require('../src/arcana/FJ_service_account.json');
const currency_api_key = '2659119d03e208f036e49bd71fd1c6ef'

const url_currencies = `http://data.fixer.io/api/latest?access_key=${currency_api_key}&base=EUR&symbols=@sym`
const currencies_ids = CURRENCIES.map(c => c.id)

const collections = {
	'maisons': MAISONS,
	'currencies': CURRENCIES,
	'smart_categories': SMART_CATEGORIES
}

const ids = {
	'maisons': 'trig',
	'currencies': 'id'
}


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();


async function getCollection(coll_name) {
	let snapshot = await db.collection('maisons').get()
	let res = []
	snapshot.forEach((doc) => {
			let o = doc.data();
			o.id = doc.id, 
			res.push(o)
	})
	return res
}

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

// met à jour les taux de conversions de devises sur Firebase
async function updateCurrenciesRates() {

	let symbols = currencies_ids.join(',')
	let url = url_currencies.replace('@sym', symbols)
	// attention : si j'ai pollué mon Array.prototype, le client rest ci-dessous va renvoyer une erreur !
  // see here : https://github.com/aacerox/node-rest-client/issues/154
	http_result = await client.Client({}).getPromise(url)

	if (http_result && http_result.data.success) {
		let fixer_conversions = http_result.data.rates
		
		console.log(fixer_conversions)
		console.log("updating local json with new rates...")
		CURRENCIES = mapAttr(CURRENCIES, 'default_rate_eur', curr => fixer_conversions[curr.id])
		console.log("writing it locally...")
		let res = fs.writeFileSync('./currencies.json', JSON.stringify(CURRENCIES, null, '\t'), 'utf8')
		console.log("pushing to firebase...")
		res = await uploadCollection('currencies')
		console.log('currencies uploaded to firebase : ', res)

		return 1
	} else {
		console.log('WARNING : failed to contact currency API, getting local currency conversion rates', url, http_result)
		return 3
	}
}

function mapAttr(arr, attr, fn) {
	return arr.map(el => {
			el[attr] = fn(el)
			return el
	})
}

// ===============================================
// ===== Mettre à jour les taux de devises =======
// ===============================================
//updateCurrenciesRates().then(res => console.log(res)).catch(err => console.log(err))

// ===============================================
// ==== Mettre à jour une collection firebase ====
// ===============================================
uploadCollection('smart_categories').then(res => console.log(res)).catch(err => console.log(err))