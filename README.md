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

## Strategies

See the [doc](https://github.com/ShaunEgan/strategy-cache/tree/master/doc) for other strategies and how to use them.
