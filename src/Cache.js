/**
 * Cache
 */
import { CacheNotFoundError } from './Errors/CacheNotFoundError'

class Cache {
  /**
   * Constructor.
   *
   * @param {AbstractCacheStrategy} strategy
   */
  constructor (strategy) {
    this._strategy = strategy
  }

  /**
   * Sets a value in the cache.
   *
   * @param {String} key The key to identify the cached data with.
   * @param {Number} ttl How long to persist the data for.
   * @param {Object} data The data to cache.
   * @returns {Promise<Object>} the data passed to the set parameter.
   */
  set (key, ttl, data) {
    return this._strategy.set(key, ttl, data)
  }

  /**
   * Sets multiple values in the cache.
   *
   * These values are passed as a hash map object, using the object keys as the cache keys.
   *
   * @param {String} ttl How long to persist the data for.
   * @param {Object} data The data to cache using the available keys.
   * @returns {Object} The data object passed as a parameter.
   */
  multiSet (ttl, data) {
    const keys = Object.keys(data)

    const setOperations = keys.map(key => this.set(key, ttl, data[key]))

    return Promise.all(setOperations)
      .then(() => data)
  }

  /**
   * Gets a value from the cache.
   *
   * @param {String} key The key to identify the cached data with.
   * @returns {Promise<Object>} the cached data.
   * @throws {CacheNotFoundError}
   */
  get (key) {
    return this._strategy.get(key)
  }

  /**
   * Gets multiple values from the cache and returns them as an hash map object.
   *
   * @param {String[]} keys
   * @returns {Promise<Object>} the requested cached data.
   */
  multiGet (keys) {
    const mapCacheNotFoundErrorToNull = error => {
      if (error instanceof CacheNotFoundError) return null
      throw error
    }

    const mapResultToNamedData = index => result => ({
      name: keys[index],
      data: result
    })

    const mapNamedDataArrayToHashMap = namedDataArray => {
      const result = {}

      namedDataArray.forEach(item => {
        result[item.name] = item.data
      })

      return result
    }

    const getOperations = keys.map((key, index) => this.get(key)
      .catch(mapCacheNotFoundErrorToNull)
      .then(mapResultToNamedData(index))
    )


    return Promise.all(getOperations)
      .then(mapNamedDataArrayToHashMap)
  }

  /**
   * Removes a value from the cache.
   *
   * @param {String} key The key to identify the cached data with.
   * @returns {Promise<String>} The key which was invalidated.
   */
  invalidate (key) {
    return this._strategy.invalidate(key)
  }

  /**
   * Invalidates multiple keys in the cache.
   *
   * @param {String[]} keys The keys to invalidate.
   * @returns {Promise<String[]>} The keys which were invalidated.
   */
  multiInvalidate (keys) {
    const invalidateOperations = keys.map(key => this.invalidate(key))
    return Promise.all(invalidateOperations)
  }

  /**
   * Gets a value from the cache. If this value does not exist, it is created with the result of calling of the supplied
   * function.
   *
   * This function must return a promise.
   *
   * @param {String} key The key to identify the cached data with.
   * @param {Number} ttl How long to persist the data for.
   * @param {Function} fn A function used to rebuild the cache.
   * @returns {Promise<Object>}
   */
  getOrSet (key, ttl, fn) {
    const refreshCacheWhenCacheNotFound = error => {
      if (error instanceof CacheNotFoundError) return fn().then(data => this.set(key, ttl, data))

      throw error
    }

    return this._strategy.get(key)
      .catch(refreshCacheWhenCacheNotFound)
  }
}

export { Cache }
