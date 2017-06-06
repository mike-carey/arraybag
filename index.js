/**
 * @module arraybag
 * @description Holds instances and information for a project
 *
 * @author Mike Carey <michael.r.carey@att.net>
 */

'use strict'

const caller = require('caller')
const findRoot = require('find-root')

const debug = require('debug')('arraybag')

const ArrayBag = require('./lib/arraybag')
ArrayBag.errors = require('./lib/errors')

function bag() {
    debug("Caller is %s", caller(2))
    let name = findRoot(caller(2))

    return ArrayBag.registry(name)
}

module.exports = new Proxy({}, {
    get: (target, prop) => {
        if (prop == "ArrayBag") {
            return ArrayBag
        }

        if (prop) {
            return bag().get(prop)
        }

        return proxy
    },
    has: (target, prop) => {
        return bag().has(prop)
    }
})