const NodeCache = require("node-cache")
const myCache = new NodeCache({ useClones: false })
global.myCache = myCache
