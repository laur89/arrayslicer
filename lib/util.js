/**
 * Utils module
 */

/**
 * Check if given object is an array-like object
 *
 * @credit Javascript: The Definitive Guide, O'Reilly, 2011
 */
function isArrayLike(o) {
    return (
        // o !== null &&
        // typeof o === "object" &&
        isFinite(o.length) &&                // o.length is a finite number
        o.length >= 0 &&                     // o.length is non-negative
        o.length === Math.floor(o.length) && // o.length is an integer
        o.length < 4294967296);               // o.length < 2^32
}

/**
 * Check for the existence of the sort function in given object
 */
function isSortable(o) {
    return (
        // o !== null &&
        // typeof o === "object" &&             // o is an object
        typeof o.sort === "function");        // o.sort is a function
}

/**
 * Check for sortable-array-like objects
 */
module.exports.isSortableArrayLike = function (o) {
    return o !== null &&
        typeof o === "object" &&
        typeof o.sort === "function" &&
        isArrayLike(o); // && isSortable(o);
};
