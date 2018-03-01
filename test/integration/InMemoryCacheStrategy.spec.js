import { default as MockDate } from 'mockdate'
import { Cache, InMemoryCacheStrategy, CacheNotFoundError } from '../../src'

describe('InMemoryCache', () => {
  const keys = ['shaun', 'roy', 'steve']
  const shaun = { name: 'shaun' }
  const roy = { name: 'roy' }
  const steve = { name: 'steve' }

  const data = { shaun, roy, steve }

  const ttl = 300

  let cache

  beforeEach(() => {
    MockDate.set('2018-01-01T00:00:00.000Z')
    cache = new Cache(new InMemoryCacheStrategy())
  })

  afterEach(() => {
    MockDate.reset()
  })

  describe('#set', () => {
    it('sets a value in the cache', () => {
      return cache.set('shaun', ttl, shaun)
        .then(() => cache.get('shaun'))
        .should.eventually.deep.equal(shaun)
    })

    it('returns the value which was passed as data', () => {
      return cache.set('shaun', ttl, shaun)
        .should.eventually.deep.equal(shaun)
    })
  })

  describe('#multiSet', () => {
    it('sets multiple values', () => {
      return cache.multiSet(ttl, data)
        .then(() => cache.get(shaun.name))
        .should.eventually.deep.equal(shaun)
        .then(() => cache.get(roy.name))
        .should.eventually.deep.equal(roy)
        .then(() => cache.get(steve.name))
        .should.eventually.deep.equal(steve)
    })
  })

  describe('#get', () => {
    it('fetches a previously cached value which has not expired', () => {
      return cache.set('shaun', ttl, shaun)
        .then(() => cache.get('shaun'))
        .should.eventually.deep.equal(shaun)
    })

    it('rejects with a CacheNotFoundError when there is no previously cached value', () => {
      return cache.get('shaun')
        .should.eventually.be.rejectedWith(CacheNotFoundError)
    })

    it('rejects with a CacheNotFoundError when the previously stored data has expired', () => {
      return cache.set('shaun', ttl, shaun)
        .then(() => MockDate.set('2018-01-01T00:05:01.000Z'))
        .then(() => cache.get('shaun'))
        .should.eventually.be.rejectedWith(CacheNotFoundError)
    })
  })

  describe('#multiGet', () => {
    it('fetches multiple values', () => {
      return cache.multiSet(ttl, data)
        .then(() => cache.multiGet(keys))
        .should.eventually.deep.equal(data)
    })

    it('returns null for unknown values', () => {
      return cache.multiGet(['test'])
        .should.eventually.deep.equal({ test: null })
    })
  })

  describe('#invalidate', () => {
    it('invalidates a previously stored cache', () => {
      return cache.set('shaun', ttl, shaun)
        .then(() => cache.invalidate('shaun'))
        .then(() => cache.get('shaun'))
        .should.eventually.be.rejectedWith(CacheNotFoundError)
    })

    it('returns the key that it was called with', () => {
      return cache.set('shaun', ttl, shaun)
        .then(() => cache.invalidate('shaun'))
        .should.eventually.equal('shaun')
    })

    it('returns the key that is was called with when the cache did not previously exist', () => {
      return cache.invalidate('shaun')
        .should.eventually.equal('shaun')
    })
  })

  describe('#multiInvalidate', () => {
    it('invalidates multiple keys', () => {
      return cache.multiSet(ttl, data)
        .then(() => cache.multiInvalidate(keys))
        .then(() => cache.multiGet(keys))
        .should.eventually.deep.equal({ shaun: null, roy: null, steve: null })
    })
  })

  describe('#getOrSet', () => {
    const fetchData = () => Promise.resolve(shaun)

    it('gets a previously set value', () => {
      return cache.set('shaun', ttl, shaun)
        .then(() => cache.getOrSet('shaun', ttl, fetchData))
        .should.eventually.deep.equal(shaun)
    })

    it('uses the provided function to refresh the cache when the value does not already exist', () => {
      return cache.getOrSet('shaun', ttl, fetchData)
        .should.eventually.deep.equal(shaun)
    })

    it('updates the cache when using the provided function', () => {
      return cache.getOrSet('shaun', ttl, fetchData)
        .then(() => cache.get('shaun'))
        .should.eventually.deep.equal(shaun)
    })

    it('uses the provided function to refresh the cache when the value has expired', () => {
      return cache.set('shaun', ttl, shaun)
        .then(() => MockDate.set('2018-01-01T00:05:01.000Z'))
        .then(() => cache.getOrSet('shaun', ttl, fetchData))
        .should.eventually.deep.equal(shaun)
    })
  })

})

