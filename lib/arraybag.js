/**
 * @module arraybag
 * @description The ArrayBag class to export
 *
 * @author Mike Carey <michael.r.carey@att.net>
 */

'use strict'

const path = require('path')

const debug = require('debug')('arraybag')

const errors = require('./errors')

let bags = {}


/**
 * A storage mecahnism
 */
class ArrayBag {

    /**
     * @type {String} FILENAME
     * The file that will hold a project's arraybag definition.  Looks to the process env ARRAYBAG variable and defaults to "arraybag.js"
     */
    static get FILENAME () {
        return process.env.ARRAYBAG || "arraybag.js"
    }

    /**
     * Initializes the data of this ArrayBag with the object provided
     *
     * @param  {Object} data The initial data
     */
    constructor (data) {
        data = data || {}
        debug("Setting the data to %O", data)
        this.data = data
    }

    /**
     * Retrieves a value from the data object
     *
     * @param  {String} key   The key that the instance was stored as
     * @param  {*}      value The default value that will be provided if the data entry does not have one
     * @return {*}            The data entry from the key provided or the default if one could not be found
     * @throws {ArrayBagUndefinedKeyError} If the entry at the key provided is undefined and the default value is undefined
     */
    get (key, value) {
        let val = this.data[key] || value
        if (val === undefined) {
            throw new errors.ArrayBagUndefinedKeyError("Could not find an entry for " + key + " and no default was provided")
        }

        return val
    }

    /**
     * Sets a property in the data entry under the key provided.
     *
     * @param {String} key   The data entry to inject or change
     * @param {*}      value The value that should be injected or changed to.  If this value is undefined, the entry will simply be deleted from the data instance.
     * @return {*}           The previous value
     */
    set (key, value) {
        let prev = this.data[key]
        if (value === undefined) {
            delete this.data[key]
        } else {
            this.data[key] = value
        }

        return prev
    }

    /**
     * Freezes the data instance to prevent anymore changes
     */
    freeze() {
        this.data = Object.freeze(this.data)
    }

    /**
     * The keys of the data instance
     *
     * @return {Array} The keys that have been defined
     */
    keys () {
        return Object.keys(this.data)
    }

    /**
     * Checks that an entry exists in the data instance
     *
     * @param  {String}  key The entry to check against
     * @return {Boolean}     True if the entry has been defined; otherwise, false
     */
    has (key) {
        return this.data.hasOwnProperty(key)
    }

    /**
     * Loads a file in as an ArrayBag for a project
     *
     * @param  {String} root The path to the project root which is concatonated with ArrayBag.FILENAME
     * @return {ArrayBag}    The initialized ArrayBag.  If the file provided an instance of ArrayBag, it will simply return what was provided from the file; otherwise, it will pass it to the ArrayBag constructor.
     */
    static load (root) {
        root = root || "."
        let _path = path.resolve(root, ArrayBag.FILENAME)
        let arraybag = undefined
        try {
            debug("Loading arraybag '%s'", _path)
            arraybag = require(_path)
        } catch (e) {
            // Rethrow if it was a bad file
            if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf("Cannot find module") !== -1 && e.message.indexOf(_path) !== -1) {

                let mod = root.split('/').pop()
                throw new errors.ArrayBagNotFoundError("Cannot not find an arraybag for " + mod + " module")
            }

            throw e
        }

        if (arraybag instanceof ArrayBag) {
            debug("Returning already existing ArrayBag")
            return arraybag
        } else {
            debug("Returning an Arraybag upon creation")
            return new ArrayBag(arraybag)
        }
    }

    /**
     * Registers an ArrayBag with the bag storage
     *
     * @param  {String}  name   The project root where this ArrayBag will be bound to
     * @param  {Boolean} freeze Indicates whether the bag should be frozen; default is true
     * @return {ArrayBag}       The instance loaded and bound under the name provided.  If it is currently undefined, the ArrayBag.load function will be called to create an instance
     */
    static registry (name, freeze) {
        freeze = freeze === false ? false : true
        if (bags[name] === undefined) {
            let bag = ArrayBag.load(name)
            if (freeze) {
                bag.freeze()
            }

            bags[name] = bag
        }

        return bags[name]
    }

    /**
     * Invalidates the cache.
     *
     * @param  {Stirng} name The name of the ArrayBag stored in cache to invalidate
     */
    static invalidate(name) {
        if (name) {
            delete bags[name]
        } else {
            bags = {}
        }
    }

}


module.exports = ArrayBag