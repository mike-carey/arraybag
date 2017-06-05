/**
 * Tests the ArrayBag object
 */

'use strict'

const _ = require('underscore')
const path = require('path')
const mock = {
    fs: require('mock-fs'),
    env: require('mock-env')
}
const assert = require('chai').assert
const mockery = require('mockery')
const decache = require('decache')

const errors = require('../lib/errors')
const ArrayBag = require('../lib/arraybag')


describe('ArrayBag Tests', () => {

    before(() => {
        mockery.registerAllowables(['../../lib/arraybag', '../lib/arraybag', './nothere', 'path', 'debug', './errors'])
    })

    after(() => {
        mockery.deregisterAll()
    })

    let mod = path.resolve("./arraybag.js")
    function getMock(file) {
        return path.join(__dirname, "mocks", file)
    }

    let data = {
        "foo": "bar",
        "bar": "baz",
        "baz": "foo"
    }

    it ('Should look to the ARRAYBAG environment variable', () => {
        assert.equal(ArrayBag.FILENAME, "arraybag.js", "Default FILENAME not returned")

        mock.env.morph(() => {
            assert.equal(ArrayBag.FILENAME, "config.js", "FILENAME was supposed set through environment")
        }, {ARRAYBAG: "config.js"})
    })

    it('Should have getters with defaults', () => {
        let bag = new ArrayBag()

        bag.data["foo"] = "bar"
        assert.equal(bag.get("foo"), "bar")
        assert.equal(bag.get("bar", "baz"), "baz")

        assert.throw(() => {
            bag.get("baz")
        }, errors.ArrayBagUndefinedKeyError)
    })

    it('Should have setters', () => {
        let bag = new ArrayBag()

        bag.data["foo"] = "bar"
        bag.set("bar", "baz")
        assert.equal(bag.data["bar"], "baz", "Could not set the key properly")

        assert.equal(bag.set("bar", "foo"), "baz", "Setting the value Should return the previous value")

        bag.set("bar")
        assert.isUndefined(bag.data["bar"], "The value was not deleted properly")

        assert.isUndefined(bag.data["baz"], "Somehow baz has already been set")
    })

    it('Should allow freezing', () => {
        let bag = new ArrayBag()

        bag.data = _.clone(data)

        bag.freeze()

        assert(Object.isFrozen(bag.data), "The data was not frozen")

        assert.throws(() => {
            bag.data["foo"] = "baz"
        }, TypeError)

        assert.throws(() => {
            delete bag.data["foo"]
        }, TypeError)

        assert.throws(() => {
            bag.set("foo")
        }, TypeError)

        assert.throws(() => {
            bag.set("foo", "baz")
        }, TypeError)
    })

    it ('Should proxy keys', () => {
        let bag = new ArrayBag()

        bag.data = data

        assert.deepEqual(bag.keys(), Object.keys(data), "Keys are not being proxied properly")

        let _data = _.clone(data)
        delete _data["foo"]

        delete bag.data["foo"]

        assert.deepEqual(bag.keys(), Object.keys(_data), "Keys Should change as the data object changes")
    })

    it ('Should properly display which keys are available', () => {
        let bag = new ArrayBag()

        assert.isUndefined(bag.data["foo"], "Somehow the foo key has been set")

        assert(!bag.has("foo"), "ArrayBag thinks it has a key that it does not")

        bag.data["foo"] = "bar"
        assert(bag.has("foo"), "ArrayBag thinks it does not have a key that it does")
    })

    it ('Should load the arraybag.js file', () => {
        mockery.enable()
        mockery.registerSubstitute(mod, getMock("arraybag"))

        let bag = ArrayBag.load()
        assert.equal(bag.data["foo"], "bar", "Did not properly grab the arraybag file")

        mockery.deregisterSubstitute(mod)


        mockery.registerSubstitute(mod, getMock("object"))

        bag = ArrayBag.load()
        assert.equal(bag.data["foo"], "bar", "Did not properly convert the object file")

        mockery.deregisterSubstitute(mod)
        mockery.disable()


        assert.throws(() => {
            let bag = ArrayBag.load()
        }, errors.ArrayBagNotFoundError)
    })

    it ('Should not suppress errors', () => {
        mockery.enable()
        mockery.registerSubstitute(mod, getMock("syntax-error"))

        assert.throws(() => {
            ArrayBag.load()
        }, SyntaxError)

        mockery.deregisterSubstitute(mod)

        // Module not found
        mockery.registerSubstitute(mod, getMock("import-error"))

        assert.throws(() => {
            ArrayBag.load()
        }, Error, "Cannot find module './nothere'")

        mockery.deregisterSubstitute(mod)
        mockery.disable()
    })

    it ('Should register arraybags', () => {
        mockery.enable()
        mockery.registerSubstitute(mod, getMock("object"))

        decache("../lib/arraybag")

        let bag = ArrayBag.registry("./")
        assert.equal(bag.data["foo"], "bar", "Did not register properly")

        let _bag = ArrayBag.registry("./")
        assert.equal(bag, _bag, "The bags should be the same from cache")

        assert(Object.isFrozen(bag.data), "The data was not frozen")

        assert.throw(() => {
            bag.data["foo"] = "baz"
        }, TypeError)

        mockery.deregisterSubstitute(mod)

        ArrayBag.invalidate("./")

        mockery.registerSubstitute(mod, getMock("arraybag"))

        bag = ArrayBag.registry("./", false)

        assert(!Object.isFrozen(bag.data), "The data was frozen")

        assert.doesNotThrow(() => {
            bag.data["foo"] = "baz"
        }, TypeError)

        decache('../lib/arraybag')

        mockery.deregisterSubstitute(mod)
        mockery.disable()
    })

})