/**
 * @module arraybag
 * @description Holds instances and information for a project
 *
 * @author Mike Carey <michael.r.carey@att.net>
 */

'use strict'

const caller = require('caller')
const findRoot = require('find-root')

const ArrayBag = require('./lib/arraybag')
const errors = require('./lib/errors')


function bag() {
    let name = findRoot(caller())

    return ArrayBag.registry(name)
}

let proxy = new Proxy({}, {
    get: (target, prop) => {
        return bag().get(prop)
    },
    has: (target, prop) => {
        return bag().has(prop)
    }
})
proxy.ArrayBag = ArrayBag
proxy.ArrayBag.errors = errors


module.exports = proxy