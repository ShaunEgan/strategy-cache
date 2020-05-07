import { createSandbox } from 'sinon'
import { Cache } from '../../src/Cache'
import { AbstractCacheStrategy } from '../../src/CacheStrategies/AbstractCacheStrategy'
import { CacheNotFoundError } from '../../src/Errors/CacheNotFoundError'

describe('Cache', () => {
  const sandbox = createSandbox()

  const keys = ['left', 'right']
  const left = { direction: 'left' }
  const right = { direction: 'right' }
  const multiData = { left, right }

  const key = 'test-key'
  const ttl = 300
  const data = { foo: 'bar' }

  let fn
  let cacheStrategy
  let cache

  beforeEach(() => {
    fn = sandbox.spy(() => Promise.resolve(data))
    cacheStrategy = sandbox.createStubInstance(AbstractCacheStrategy)
    cache = new Cache(cacheStrategy)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#get', () => {
    it('calls get on the CacheStrategy', () => {
      cacheStrategy.get
        .withArgs(key)
        .resolves(data)

      return cache.get(key)
        .then(result => {
          result.should.deep.equal(data)
          cacheStrategy.get.should.have.been
            .calledOnce()
            .calledWith(key)
        })
    })

    it('lets errors bubble up from the cache strategy', () => {
      cacheStrategy.get
        .withArgs(key)
        .rejects(new CacheNotFoundError())

      return cache.get(key).should.eventually.be.rejectedWith(CacheNotFoundError)
    })
  })

  describe('#multiGet', () => {
    it('calls get on the Cache Strategy the correct number of times', () => {
      cacheStrategy.get
        .resolves()

      return cache.multiGet(keys)
        .then(() => {
          cacheStrategy.get.should.have.been.calledTwice()
        })
    })

    it('calls get on the Cache Strategy with the correct arguments', () => {
      cacheStrategy.get
        .resolves()

      return cache.multiGet(['left'])
        .then(() => {
          cacheStrategy.get.should.have.been.calledWith('left')
        })
    })

    it('resolves multiple values', () => {
      cacheStrategy.get
        .withArgs('left')
        .resolves(left)

      cacheStrategy.get
        .withArgs('right')
        .resolves(right)

      return cache.multiGet(keys).should.eventually.deep.equal(multiData)
    })

    it('resolves invalid values as null', () => {
      cacheStrategy.get
        .rejects(new CacheNotFoundError())

      return cache.multiGet(keys).should.eventually.deep.equal({ left: null, right: null })
    })
  })

  describe('#set', () => {
    it('calls set on the CacheStrategy', () => {
      cacheStrategy.set
        .withArgs(key, ttl, data)
        .resolves(data)

      return cache.set(key, ttl, data)
        .then(result => {
          result.should.deep.equal(data)
          cacheStrategy.set.should.have.been
            .calledOnce()
            .calledWith(key, ttl, data)
        })
    })
  })

  describe('#multiSet', () => {
    it('calls set on the CacheStrategy the correct amount of times', () => {
      cacheStrategy.set
        .resolves()

      return cache.multiSet(ttl, multiData)
        .then(() => cacheStrategy.set.should.have.been.calledTwice())
    })

    it('calls set with the correct arguments', () => {
      cacheStrategy.set
        .resolves()

      return cache.multiSet(ttl, { left })
        .then(() => cacheStrategy.set.should.have.been.calledWith('left', ttl, left))
    })

    it('results the data object passed to it', () => {
      cacheStrategy.set
        .resolves()

      return cache.multiSet(ttl, multiData).should.eventually.deep.equal(multiData)
    })
  })

  describe('#invalidate', () => {
    it('calls invalidate on the CacheStrategy', () => {
      cacheStrategy.invalidate
        .withArgs(key)
        .resolves(key)

      return cache.invalidate(key)
        .then(result => {
          result.should.equal(key)
          cacheStrategy.invalidate.should.have.been
            .calledOnce()
            .calledWith(key)
        })
    })
  })

  describe('#multiInvalidate', () => {
    it('calls invalidate on the CacheStrategy the correct amount of times', () => {
      cacheStrategy.invalidate
        .resolves()

      return cache.multiInvalidate(keys)
        .then(() => {
          cacheStrategy.invalidate.should.have.been.calledTwice()
        })
    })

    it('calls invalidate with the correct arguments', () => {
      cacheStrategy.invalidate
        .resolves()

      return cache.multiInvalidate(['left'])
        .then(() => cacheStrategy.invalidate.should.have.been.calledWith('left'))
    })

    it('resolves the keys passed to it', () => {
      cacheStrategy.invalidate
        .withArgs('left')
        .resolves('left')

      cacheStrategy.invalidate
        .withArgs('right')
        .resolves('right')

      return cache.multiInvalidate(keys).should.eventually.deep.equal(keys)
    })
  })

  describe('#getOrSet', () => {
    describe('when there is existing cached data', () => {
      it('returns the data with no further actions', () => {
        cacheStrategy.get
          .withArgs(key)
          .resolves(data)

        return cache.getOrSet(key, ttl, fn)
          .then(result => {
            result.should.deep.equal(data)

            cacheStrategy.get.should.have.been
              .calledOnce()
              .calledWith(key)

            fn.should.not.have.been.called()

            cacheStrategy.set.should.not.have.been.called()
          })
      })
    })

    describe('when there is no existing cached data', () => {
      it('rebuilds the cache and returns the new value', () => {
        cacheStrategy.get
          .withArgs(key)
          .rejects(new CacheNotFoundError())

        cacheStrategy.set
          .withArgs(key, ttl, data)
          .resolves(data)

        return cache.getOrSet(key, ttl, fn)
          .then(result => {
            result.should.deep.equal(data)

            cacheStrategy.get.should.have.been
              .calledOnce()
              .calledWith(key)

            fn.should.have.been.calledOnce()

            cacheStrategy.set.should.have.been
              .calledOnce()
              .calledWith(key, ttl, data)
          })
      })
    })

    describe('when the cache strategy throws an unexpected error', () => {
      it('lets that error bubble up instead of rebuilding the cache', () => {
        cacheStrategy.get
          .withArgs(key)
          .rejects(new Error())

        return cache.getOrSet(key, ttl, fn).should.be.rejectedWith(Error)
          .then(() => {
            fn.should.not.have.been.called()
            cacheStrategy.set.should.not.have.been.called()
          })
      })
    })
  })
})
