'use strict';
/**
 * Currency rate request that got passed through the promise chain
 * @typedef {object} RateRequest
 * @property {string} from
 * @property {string} to
 * @property {number} success_count
 * @property {number} failed_count
 * @property {string} data
 * @property {number} job_id
 * @property {number} last_success_ts
 * @property {number} last_fail_ts
 */
class RateRequest {
    constructor(from, to, success_count, failed_count, job_id, success_ts, fail_ts) {
        this._from = from;
        this._to = to;
        this._success_count = success_count || 0;
        this._failed_count = failed_count || 0;
        this._data = '';
        this._job_id = job_id || -1;
        this._last_success_ts = success_ts || 1;
        this._last_fail_ts = fail_ts || 0;
    }

    get from() {
        return this._from;
    }

    get to() {
        return this._to;
    }

    get job_id() {
        return this._job_id;
    }

    get success_count() {
        return this._success_count;
    }

    set success_count(count) {
        this._success_count = count;
    }

    get failed_count() {
        return this._failed_count;
    }

    set failed_count(count) {
        this._failed_count = count;
    }

    get data() {
        return this._data;
    }

    set data(new_data) {
        this._data = new_data;
    }

    get last_success_ts() {
        return this._last_success_ts;
    }

    set last_success_ts(ts) {
        this._last_success_ts = ts;
    }

    get last_fail_ts() {
        return this._last_fail_ts;
    }

    set last_fail_ts(ts) {
        this._last_fail_ts = ts;
    }
}

module.exports = RateRequest;
