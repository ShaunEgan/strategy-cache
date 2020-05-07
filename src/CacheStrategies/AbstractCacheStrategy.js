/* eslint-disable */
// @TODO this was meant to work as a basic abstract. This project will be reworked into typescript

const rejectBaseClassUsage = method => Promise.reject(`Called #${method} on base class AbstractCacheStrategy`)

/**
 * AbstractCacheStrategy.
 */
class AbstractCacheStrategy {
  /**
   * Sets a value in the cache.
   *
   * @param {String} key The key to identify the cached data with.
   * @param {Number} ttl How long to persist the data for.
   * @param {Object} data The data to cache.
   * @returns {Promise<Object>} the data passed to the set parameter.
   */
  set (key, ttl, data) {
    return rejectBaseClassUsage('set')
  }

  /**
   * Gets a value from the cache.
   *
   * @param {String} key The key to identify the cached data with.
   * @returns {Promise<Object>} the cached data.
   * @throws {CacheNotFoundError}
   */
  get (key) {
    return rejectBaseClassUsage('get')
  }

  /**
   * Removes a value from the cache.
   *
   * @param {String} key The key to identify the cached data with.
   * @returns {String} The key which was invalidated.
   */
  invalidate (key) {
    return rejectBaseClassUsage('invalidate')
  }
}

export { AbstractCacheStrategy }
