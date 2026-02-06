/**
 * Binary search implementation
 */

/**
 * Main search recursive function
 */
function loop(data, min_idx, max_idx, value, valpos) {

    // set current position/index as the middle point between min and max
    const idx = (max_idx + min_idx) >>> 1;

    // compare current index value with the one we are looking for
    const diff = this.compare(data[idx][this.index], value);

    // found?
    if (diff === 0) {
        return valpos[value] = {
            "found": true,
            "index": idx,
            "prev": null,
            "next": null
        };
    }

    // no more positions available?
    if (min_idx >= max_idx) {
        return valpos[value] = {
            "found": false,
            "index": null,
            "prev": (diff < 0) ? max_idx : max_idx - 1,
            "next": (diff < 0) ? max_idx + 1 : max_idx
        };
    }

    // continue looking for index in one of the remaining array halves
    // current position can be skipped as index is not there...
    if (diff > 0)
        return loop.call(this, data, min_idx, idx - 1, value, valpos);
    else
        return loop.call(this, data, idx + 1, max_idx, value, valpos);
}

/**
 * Search bootstrap
 * The function has to be executed in the context of the IndexedArray object,
 * ie IndexedArray's this reference needs to be bound!
 */
function search(index) {
    return loop.call(this, this.data, 0, this.data.length - 1, index, this.valpos);
}

/**
 * Export search function
 */
module.exports.search = search;
