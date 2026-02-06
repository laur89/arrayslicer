/**
 * Indexed Array Binary Search module
 */

/**
 * Dependencies
 */
const util = require("./util"),
    cmp = require("./compare"),
    bin = require("./search/binary");

/**
 * Module interface definition
 */
module.exports = IndexedArray;

/**
 * Indexed Array constructor
 *
 * It loads the array data, defines the index field and the comparison function
 * to be used.
 *
 * @param {Array} data is an array of objects
 * @param {String} index is the object's property used to search the array
 */
function IndexedArray(data, index) {

    // is data sortable array or array-like object?
    if (!util.isSortableArrayLike(data))
        throw new Error("Invalid data");

    // is index a valid property?
    if (!index || data.length > 0 && !(index in data[0]))
        throw new Error("Invalid index");

    // data array
    this.data = data;

    // name of the index property, ie this is the index we use to access the actual value
    this.index = index;

    // set index boundary _values_ (minv & maxv), not indices
    this.setBoundaries();

    // set comparison function used, based on value type
    this.compare = typeof this.minv === "number" ? cmp.numcmp : cmp.strcmp;

    // default search function
    this.search = bin.search;

    // cache of value->index map
    // each mapping value is stored as an object:  { found: true|false, index: array-index, prev: prev_idx, next: next_idx }
    this.valpos = {};

    // cursor and adjacent positions
    this.cursor = null;   // index of cursor, if it's set on a value that's contained in array. note in this case this.next{low,high} will be set to null (since cursor is not between values)
    this.nextlow = null;  // index of closest (relative to cursor) low value; only non-null if cursor = null
    this.nexthigh = null;  // index of closest (relative to cursor) high value; only non-null if cursor = null
}

/**
 * Set the comparison function
 *
 * @param {Function} fn to compare index values that returnes 1, 0, -1
 */
IndexedArray.prototype.setCompare = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.compare = fn;
    return this;
};

/**
 * Set the search function
 *
 * @param {Function} fn to search index values in the array of objects
 */
IndexedArray.prototype.setSearch = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.search = fn;
    return this;
};

/**
 * Sort the data array by its index property
 */
IndexedArray.prototype.sort = function () {
    const self = this
    const index = this.index;

    // sort the array
    this.data.sort(function (a, b) {
        return self.compare(a[index], b[index]);
    });

    // recalculate boundary values (minv & maxv)
    this.setBoundaries();

    return this;
};

/**
 * Inspect the underlying data array and set its boundary values (not indices!);
 * minv = minimum _value_
 * maxv = maximum _value_
 */
IndexedArray.prototype.setBoundaries = function () {
    this.minv = this.data.length && this.data[0][this.index];
    this.maxv = this.data.length && this.data[this.data.length - 1][this.index];

    return this;
};

/**
 * Get the position of the object corresponding to the given index
 *
 * @param {Number|String} value  item whose index in underlying array to locate
 * @returns {Object} self
 */
IndexedArray.prototype.fetch = function (value) {
    // check array is not empty
    if (this.data.length === 0) {
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = null;
        return this;
    // check the request is within range
    } else if (this.compare(value, this.minv) < 0) {
        // value is out of our array on left-hand side
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = 0;
        return this;
    } else if (this.compare(value, this.maxv) > 0) {
        // value is out of our array on right-hand side
        this.cursor = null;
        this.nextlow = this.data.length - 1;
        this.nexthigh = null;
        return this;
    }

    const pos = this.valpos[value];

    // if the request is memorized, return it from cache...
    if (pos !== undefined) {
        if (pos.found) {
            this.cursor = pos.index;
            this.nextlow = null;
            this.nexthigh = null;
        } else {
            this.cursor = null;
            this.nextlow = pos.prev;
            this.nexthigh = pos.next;
        }
        return this;
    }

    // ...if not, do the search:
    const result = this.search.call(this, value);
    this.cursor = result.index;
    this.nextlow = result.prev;
    this.nexthigh = result.next;
    return this;
};

/**
 * Get the object corresponding to the given index
 *
 * When no value is given, the function will default to the last fetched item.
 *
 * @param {Number|String} [optional] index is the id of the requested object
 * @returns {Object} the found object or null
 */
IndexedArray.prototype.get = function (value) {
    if (value)
        this.fetch(value);

    const pos = this.cursor;
    return pos !== null ? this.data[pos] : null;
};

/**
 * Get an slice of the data array
 *
 * Boundaries have to be in order.
 *
 * @param {Number|String} begin index is the id of the requested object
 * @param {Number|String} end index is the id of the requested object
 * @returns {Object} the slice of data array or []
 */
IndexedArray.prototype.getRange = function (begin, end) {
    // check if boundaries are in order
    if (this.compare(begin, end) > 0) {
        return [];
    }

    // fetch start and default to the next index above
    this.fetch(begin);
    const start = this.cursor || this.nexthigh;

    // fetch finish and default to the next index below
    this.fetch(end);
    const finish = this.cursor || this.nextlow;

    // if any boundary is not set, return no range
    if (start === null || finish === null) {
        return [];
    }

    // return range
    return this.data.slice(start, finish + 1);
};
