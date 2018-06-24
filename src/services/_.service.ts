import moment from 'moment';
import { markParentViewsForCheck } from '@angular/core/src/view/util';

export const _ = {
    sum,
    traverse,
    listMonths,
    mapObj
}

export function augmentPrototypes() {
    Array.prototype['sum'] = function () {
        return this.reduce((a,b) => a+b, 0)
    }
}

export function sum(arr) {
    return arr.reduce((a,b) => a+b, 0)
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
export function mapObj(arr, fn_id, fn_val) {
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