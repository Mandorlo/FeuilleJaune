import moment from 'moment';


Array.prototype['sum'] = function () {
    return this.reduce((a,b) => a+b, 0)
}


export const _ = {
    sum,
    traverse,
    listMonths
}

export function sum(arr) {
    return arr.reduce((a,b) => a+b, 0)
}

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