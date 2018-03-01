import { default as AWS } from 'aws-sdk'
import { Cache } from '../../src/Cache'
import { DynamoDbCacheStrategy } from '../../src/CacheStrategies/DynamoDbCacheStrategy'
import { CacheNotFoundError } from '../../src/Errors/CacheNotFoundError'

describe('dynamodb-cache', () => {
  AWS.config.update({ region: 'ap-southeast-1' })

  const tableName = 'test-table'
  const endpoint = new AWS.Endpoint('http://localhost:8000')
  const dynamodb = new AWS.DynamoDB({ endpoint })
  const documentClient = new AWS.DynamoDB.DocumentClient({ endpoint })

  const key = 'shaun'
  const keys = ['shaun', 'roy', 'steve']
  const shaun = { name: 'shaun' }
  const roy = { name: 'roy' }
  const steve = { name: 'steve' }

  const data = { shaun, roy, steve }
  const ttl = 1

  const queryParams = {
    TableName: tableName,
    Key: {
      key
    }
  }

  const fetchCachedData = () => documentClient.get(queryParams).promise()

  const checkCachedDataResult = expected => result => {
    result.should.have.property('Item')
    const cachedData = result.Item

    cachedData.key.should.equal(key)
    cachedData.data.should.deep.equal(expected)
    cachedData.ttl.should.be.an.integer()
  }

  let cache

  beforeEach(() => {
    const params = {
      AttributeDefinitions: [
        {
          AttributeName: 'key',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'key',
          KeyType: 'HASH'
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      TableName: tableName
    }

    return dynamodb.createTable(params).promise()
      .then(() => {
        cache = new Cache(new DynamoDbCacheStrategy(documentClient, tableName))
      })
  })

  afterEach(() => {
    const params = {
      TableName: tableName
    }

    return dynamodb.deleteTable(params).promise()
  })

  describe('#constructor', () => {
    it('instantiates', () => {
      cache.should.be.an.instanceOf(Cache)
    })
  })

  describe('#set', () => {
    it('sets a value in the cache', () => {
      return cache.set(key, ttl, shaun)
        .then(result => result.should.deep.equal(shaun))
    })

    it('returns the value which was passed as data', () => {
      return cache.set(key, ttl, shaun)
        .then(fetchCachedData)
        .then(checkCachedDataResult(shaun))
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
      return cache.set(key, ttl, shaun)
        .then(() => cache.get(key))
        .should.eventually.deep.equal(shaun)
    })

    it('rejects with a CacheNotFoundError when there is no previously cached value', () => {
      return cache.get(key)
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
      return cache.set(key, ttl, shaun)
        .then(() => cache.invalidate(key))
        .then(() => cache.get(key))
        .should.eventually.be.rejectedWith(CacheNotFoundError)
    })

    it('returns the key that it was called with', () => {
      return cache.set(key, ttl, shaun)
        .then(() => cache.invalidate(key))
        .should.eventually.equal(key)
    })

    it('returns the key that is was called with when the cache did not previously exist', () => {
      return cache.invalidate(key)
        .should.eventually.equal(key)
    })

    it('deletes the value from DynamoDb', () => {
      return cache.set(key, ttl, data)
        .then(() => cache.invalidate(key))
        .then(fetchCachedData)
        .then(result => {
          result.should.not.have.property('Item')
        })
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
      return cache.set(key, ttl, shaun)
        .then(() => cache.getOrSet(key, ttl, fetchData))
        .should.eventually.deep.equal(shaun)
    })

    it('uses the provided function to refresh the cache when the value does not already exist', () => {
      return cache.getOrSet(key, ttl, fetchData)
        .should.eventually.deep.equal(shaun)
    })

    it('updates the cache when using the provided function', () => {
      return cache.getOrSet(key, ttl, fetchData)
        .then(() => cache.get(key))
        .should.eventually.deep.equal(shaun)
    })
  })
})
