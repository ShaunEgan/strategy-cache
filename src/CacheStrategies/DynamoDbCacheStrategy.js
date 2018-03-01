import { default as moment } from 'moment'
import { AbstractCacheStrategy } from './AbstractCacheStrategy'
import { CacheNotFoundError } from '../Errors/CacheNotFoundError'

/**
 * DynamoDbCacheStrategy
 */
class DynamoDbCacheStrategy extends AbstractCacheStrategy {
  /**
   * Constructor.
   *
   * @param {AWS.DynamoDB.DocumentClient} documentClient
   * @param {String} tableName
   */
  constructor (documentClient, tableName) {
    super()
    this._documentClient = documentClient
    this._tableName = tableName
  }

  /**
   * @inheritDoc
   */
  set (key, ttl, data) {
    const calculateTtl = seconds => moment().add(seconds, 'seconds').unix()

    const params = {
      TableName: this._tableName,
      Item: {
        key,
        data,
        ttl: calculateTtl(ttl)
      }
    }

    return this._documentClient.put(params).promise()
      .then(() => data)
  }

  /**
   * @inheritDoc
   */
  get (key) {
    const throwIfNoResults = result => {
      if (!result.Item) throw new CacheNotFoundError()

      return result
    }

    const params = {
      TableName: this._tableName,
      Key: {
        key
      }
    }

    return this._documentClient.get(params).promise()
      .then(throwIfNoResults)
      .then(result => result.Item.data)
  }

  /**
   * @inheritDoc
   */
  invalidate (key) {
    const params = {
      TableName: this._tableName,
      Key: {
        key
      }
    }

    return this._documentClient.delete(params).promise()
      .then(() => key)
  }
}

export { DynamoDbCacheStrategy }
