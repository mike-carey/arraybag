/**
 * Tests the entry point
 */

'use strict'

const path = require('path')
const assert = require('chai').assert
const decache = require('decache')
const mockery = require('mockery')

const ArrayBag = require('../lib/ArrayBag')
const errors = require('../lib/errors')

const util = require('./util')


describe('Entrypoint', () => {

    let mod = path.resolve("./arraybag.js")

    before(() => {
        mockery.registerAllowables(['caller', 'find-root', 'path', 'fs', 'debug', './lib/arraybag', './lib/errors', '../index', '../../lib/arraybag', './errors'])
    })

    beforeEach(() => {
        decache('../index')
    })

    it('Should return the ArrayBag class', () => {
        let index = require('../index')

        assert.equal(ArrayBag.name, index.ArrayBag.name, "ArrayBag class should be returned when ArrayBag is accessed")
    })

    it('Should have the error attached', () => {
        let index = require('../index')

        assert.equal(errors, index.ArrayBag.errors, "ArrayBag errors should be attached the object")
    })

    it('Should return a property of the arraybag', () => {
        mockery.enable()
        mockery.registerSubstitute(mod, util.getMock('object'))

        let index = require('../index')

        assert.equal(index.foo, "bar", "Did not proxy correctly")

        mockery.deregisterSubstitute(mod)
        mockery.disable()
    })

})