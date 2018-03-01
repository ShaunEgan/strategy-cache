class CacheNotFoundError extends Error {
  constructor (message = 'Cache not found') {
    super(message)
  }
}

export { CacheNotFoundError }
