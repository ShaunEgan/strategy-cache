import { default as MockDate } from 'mockdate'
import { InMemoryCacheStrategy } from '../../../src/CacheStrategies/InMemoryCacheStrategy'
import { CacheNotFoundError } from '../../../src/Errors/CacheNotFoundError'

describe('InMemoryCacheStrategy', () => {
  const key = 'test-key'
  const data = { foo: 'bar' }
  const ttl = 300

  let inMemoryCacheStrategy

  beforeEach(() => {
    MockDate.set('2018-01-01T00:00:00.000Z')

    inMemoryCacheStrategy = new InMemoryCacheStrategy()
  })

  afterEach(() => {
    MockDate.reset()
  })

  describe('#set', () => {
    it('returns the value passed to it', () => {
      return inMemoryCacheStrategy.set(key, ttl, data)
        .should.eventually.deep.equal(data)
    })

    it('sets the value in the cache', () => {
      return inMemoryCacheStrategy.set(key, ttl, data)
        .then(() => inMemoryCacheStrategy.get(key))
        .should.eventually.deep.equal(data)
    })
  })

  describe('#get', () => {
    it('fetches an existing value', () => {
      return inMemoryCacheStrategy.set(key, ttl, data)
        .then(() => inMemoryCacheStrategy.get(key))
        .should.eventually.deep.equal(data)
    })

    it('throws a CacheNotFoundError when the value is not present in the cache', () => {
      return inMemoryCacheStrategy.get(key).should.eventually.be.rejectedWith(CacheNotFoundError)
    })

    it('throws a CacheNotFoundError when the value in cache has expired', () => {
      return inMemoryCacheStrategy.set(key, ttl, data)
        .then(() => MockDate.set('2018-01-01T00:05:01.000Z'))
        .then(() => inMemoryCacheStrategy.get(key))
        .should.eventually.be.rejectedWith(CacheNotFoundError)
    })
  })

  describe('#invalidate', () => {
    it('invalidates a previously stored cache', () => {
      return inMemoryCacheStrategy.set(key, ttl, data)
        .then(() => inMemoryCacheStrategy.invalidate(key))
        .then(() => inMemoryCacheStrategy.get(key))
        .should.eventually.be.rejectedWith(CacheNotFoundError)
    })

    it('returns the key that it was called with', () => {
      return inMemoryCacheStrategy.set(key, ttl, data)
        .then(() => inMemoryCacheStrategy.invalidate(key))
        .should.eventually.equal(key)
    })

    it('returns the key that is was called with when the cache did not previously exist', () => {
      return inMemoryCacheStrategy.invalidate(key)
        .should.eventually.equal(key)
    })
  })
})
