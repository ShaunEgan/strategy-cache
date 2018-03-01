# Strategy Cache

A package for providing caching.

## Usage

```js
import { Cache, InMemoryCacheStrategy } from 'strategy-cache'

const cache = new Cache(new InMemoryCacheStrategy())

const key = 'answer'
const ttl = 300
const calculate = () => Promise.resolve(2+2)

const answer = cache.getOrSet(key, ttl, calculate)
```

See the integration tests for more usage examples.

