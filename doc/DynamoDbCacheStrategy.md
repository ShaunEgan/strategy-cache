# DynamoDB Cache Strategy

This strategy uses DynamoDB as a data store for the cache. This is useful in the serverless world
as no persistent connections are required.

## Usage

This strategy requires a table with a HASH key called `key` and a RANGE key called `ttl`, Eg.

```yaml
CacheTable:
  Type: AWS::DynamoDB::Table
  Properties:
    TableName: cache-table
    AttributeDefinitions:
      - AttributeName: key
        AttributeType: S
    KeySchema:
      - AttributeName: key
        KeyType: HASH
    TimeToLiveSpecification:
      AttributeName: ttl
      Enabled: true
    ProvisionedThroughput:
      ReadCapacityUnits: 1
      WriteCapacityUnits: 1
```

Then the strategy can be used as follows:

```js
import { Cache, DynamoDbCacheStrategy } from 'strategy-cache'

const tableName = 'cache-table'
const documentClient = new AWS.DynamoDB.DocumentClient()

const cacheStrategy = new DynamoDbCacheStrategy(documentClient, tableName)
const cache = new Cache(cacheStrategy)

const key = 'answer'
const ttl = 300
const calculate = () => Promise.resolve(2+2)

const answer = cache.getOrSet(key, ttl, calculate)
```
