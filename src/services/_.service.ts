Array.prototype['sum'] = function () {
    return this.reduce((a,b) => a+b, 0)
}

export const _ = {
    sum,
    traverse
}

function sum(arr) {
    return arr.reduce((a,b) => a+b, 0)
}

function traverse(obj, condition, result, tree = {}) {
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