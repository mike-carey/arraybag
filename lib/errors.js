/**
 *
 */

'use strict'


class ArrayBagError extends Error {

    get code() {
        return 'ARRAYBAG_ERROR'
    }

}

class ArrayBagNotFoundError extends ArrayBagError {

    get code() {
        return 'ARRAYBAG_NOTFOUND'
    }

}

class ArrayBagUndefinedKeyError extends ArrayBagError {

    get code() {
        return 'ARRAYBAG_UNDEFINEDKEY'
    }

}


module.exports = {
    ArrayBagError: ArrayBagError,
    ArrayBagNotFoundError: ArrayBagNotFoundError,
    ArrayBagUndefinedKeyError: ArrayBagUndefinedKeyError
}