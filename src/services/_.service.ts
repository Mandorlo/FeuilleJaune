import * as moment from 'moment';

export const _ = {
    sum,
    mean,
    traverse,
    listMonths,
    map2Obj,
    sortBy,
    values,
    keys,
    map,
    sort,
    filter,
    reverse,
    identity,
    xor
}

export function λ(val) {
    let o = {
        _data: val,
        sum: null,
        mean: null,
        traverse: null,
        listMonths: null,
        map2Obj: null,
        sortBy: null,
        values: null,
        keys: null,
        map: null,
        sort: null,
        filter: null,
        reverse: null,
        identity: null,
        xor: null
    }
    for (let fn_name in _) {
        o[fn_name] = function() {
            let args = Array.prototype.slice.call(arguments)
            let res;
            if (_[fn_name].length == 1) res = _[fn_name](o._data);
            else res = _[fn_name](o._data, ...args);
            let type = typeof res;
            if (type == 'string' || type == 'number') return res;
            return λ(res)
        }
    }
    return o
}

export function map(arr, fn_or_attr) {
    if (typeof fn_or_attr == 'string') return arr.map(el => el[fn_or_attr])
    return arr.map(fn_or_attr)
}

export function filter(arr, fn) {
    return arr.filter(fn)
}

export function reverse(arr) {
    return arr.reverse()
}

export function sort(arr, fn = null) {
    if (!fn) return arr.sort();
    return arr.sort(fn)
}

// façon plus concise de dire Object.getOwnPropertyNames()
export function keys(obj) {
    return Object.getOwnPropertyNames(obj)
}

export function augmentPrototypes() {
    Array.prototype['sum'] = function () {
        return this.reduce((a,b) => a+b, 0)
    }
}

export function sum(arr) {
    return arr.reduce((a,b) => a+b, 0)
}

export function mean(arr) {
    return arr.reduce((a,b) => a+b, 0) / arr.length
}

export function variance(arr) {
    let mean_carres = arr.map(el => el * el).reduce((a,b) => a+b, 0) / arr.length
    let mean = arr.reduce((a,b) => a+b, 0).sum() / arr.length
    return mean_carres - mean * mean
}

export function uniq(arr) {
    let unique = []
    for (let el of arr) {
        if (unique.indexOf(el) < 0) unique.push(el)
    }
    return unique
}

export function xor(arr1, arr2, fn = null) {
    let arr = []
    let xor1 = identity(arr1)
    let xor2 = identity(arr2)
    if (fn && typeof fn == 'string') {
        xor1 = arr1.map(el => el[fn])
        xor2 = arr2.map(el => el[fn])
    } else if (fn) {
        xor1 = arr1.map(fn)
        xor2 = arr2.map(fn)
    }
    for (let i = 0; i < arr1.length; i++) {
        if (xor2.indexOf(xor1[i]) < 0) arr.push(arr1[i])
    }
    for (let i = 0; i < arr2.length; i++) {
        if (xor1.indexOf(xor2[i]) < 0) arr.push(arr2[i])
    }
    return arr
}

// c'est la fonction f(arr) = arr (mais arr est copié, c'est un autre objet) :)
export function identity(arr) {
    if (!arr || typeof arr.map != 'function') return arr;
    return arr.map(el => el)
}

// un peu comme _.values mais avec un champ id optionnel
export function values(obj, show_id = false) {
    let arr = []
    for (let id in obj) {
      let o = JSON.parse(JSON.stringify(obj[id]))
      if (show_id) o.id = id;
      arr.push(o)
    }
    return arr
  }

// arr est un array d'objet. 
// mapAttr renvoie un nouvel array des mêmes objets mais avec l'attribut attr mis à jour avec fn(el)
export function mapAttr(arr, attr, fn) {
    return arr.map(el => {
        el[attr] = fn(el)
        return el
    })
}


// renvoie un objet à partir d'un array
export function map2Obj(arr, fn_id, fn_val) {
    let o = {}
    for (let i = 0; i < arr.length; i++) {
        let key;
        if (typeof fn_id == 'string') key = arr[i][fn_id];
        else key = fn_id(arr[i]);

        let val;
        if (typeof fn_val == 'string') val = arr[i][fn_val];
        else val = fn_val(arr[i])

        o[key] = val
    }
    return o
}

// traverse un objet profondément et dès que @condition(attr, val, tree) est vérifiée, on renvoie result(attr, val, tree)
export function traverse(obj, condition, result, tree = {}) {
    let debug = false
    let new_obj = {}
    if (debug) console.log("traversing OBJ : ", obj)
    if (typeof obj == 'object' && !obj.length) {
        if (debug) console.log("OBJ ok")
        for (let attr in obj) {
            if (condition(attr, obj[attr], tree)) {
                new_obj[attr] = result(attr, obj[attr], tree)
                if (debug) console.log("condition passed for " + attr, new_obj[attr], tree)
            } else {
                if (debug) console.log("going to traverse one level deeper on " + attr)
                new_obj[attr] = traverse(obj[attr], condition, result, {val: attr, parent: tree})
            }
        }
        return new_obj
    } else if (condition(null, obj, tree)) {
        if (debug) console.log('not obj but condition true. Returning : ', result(null, obj, tree))
        return result(null, obj, tree)
    } else {
        if (debug) console.log('not obj. Returning : ', obj)
        return obj
    }
}

export function sortBy(arr, attr_or_fun) {
    if (typeof attr_or_fun == 'string') {
        let key = attr_or_fun;
        return arr.sort((el1, el2) => (el1[key] < el2[key]) ? -1: 1)
    } else {
        let fn = attr_or_fun;
        return arr.sort((el1, el2) => (fn(el1) < fn(el2)) ? -1: 1)
    }
}

// ===========================================================
//                  MORE SPECIFIC FUNCTIONS
// ===========================================================

// renvoie la liste des mois au format 'YYYY-MM-01' entre start (inclus) et end (inclus)
// si end = null, on termine au mois courant
export function listMonths (start, end = null) {
    if (typeof start == 'string') start = moment(start, 'YYYY-MM-DD').startOf('month')
    if (!end) end = moment().startOf('month')
    if (typeof end == 'string') end = moment(end, 'YYYY-MM-DD').startOf('month')
    start = start.startOf('month')
    end = end.startOf('month')

    let months = [start.format('YYYY-MM-DD')]
    let i = 1
    while (start.add(1, 'months').isSameOrBefore(end)) { // because .add mutates start
        months.push(start.format('YYYY-MM-DD'))
        i++
    }
    return months
}