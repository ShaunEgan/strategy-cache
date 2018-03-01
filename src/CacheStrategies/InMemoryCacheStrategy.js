import { default as moment } from 'moment'
import { AbstractCacheStrategy } from './AbstractCacheStrategy'
import { CacheNotFoundError } from '../Errors/CacheNotFoundError'

const getCurrentDateTime = () => moment().unix()
const getExpiryDateTime = ttl => moment().add(ttl, 'seconds').unix()

/**
 * InMemoryCacheStrategy
 */
class InMemoryCacheStrategy extends AbstractCacheStrategy {
  /**
   * Constructor.
   */
  constructor () {
    super()
    this._cache = {}
  }

  /**
   * @inheritDoc
   */
  set (key, ttl, data) {
    this._cache[key] = {
      data,
      ttl: getExpiryDateTime(ttl)
    }

    return Promise.resolve(data)
  }

  /**
   * @inheritDoc
   */
  get (key) {
    const cached = this._cache[key]

    if (!cached) return Promise.reject(new CacheNotFoundError())
    if (cached.ttl < getCurrentDateTime()) return Promise.reject(new CacheNotFoundError())

    return Promise.resolve(cached.data)
  }

  /**
   * @inheritDoc
   */
  invalidate (key) {
    delete this._cache[key]

    return Promise.resolve(key)
  }
}

export { InMemoryCacheStrategy }
