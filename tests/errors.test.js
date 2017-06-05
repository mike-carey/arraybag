/**
 *
 */

'use strict'

const assert = require('chai').assert

const errors = require('../lib/errors')


describe('ArrayBag Error Tests', () => {

    it ('should have unique error codes', () => {
        assert.equal((new errors.ArrayBagError()).code, "ARRAYBAG_ERROR")
        assert.equal((new errors.ArrayBagNotFoundError()).code, "ARRAYBAG_NOTFOUND")
        assert.equal((new errors.ArrayBagUndefinedKeyError()).code, "ARRAYBAG_UNDEFINEDKEY")
    })

})