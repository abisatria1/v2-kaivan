const deleteCacheMiddleware = () => {
  return (req, res, next) => {
    const keys = myCache.keys()
    const orderKeys = keys.filter((key) => key != "account")
    myCache.del(orderKeys)
    next()
  }
}

module.exports = {
  deleteCacheMiddleware,
}
