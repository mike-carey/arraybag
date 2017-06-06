/**
 * @module util
 * @description Testing utilities
 */

'use strict'

const path = require('path')


module.exports = {
    getMock: (file) => {
        return path.join(__dirname, "mocks", file)
    }
}