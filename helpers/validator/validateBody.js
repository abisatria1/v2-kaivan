const Joi = require("joi")
const { response } = require("../wrapper")

const validateBody = (schema) => {
  return (req, res, next) => {
    const result = Joi.validate(req.body, schema, { abortEarly: false })
    if (result.error) {
      let errorData = []
      result.error.details.map((item) => {
        let error = {
          path: item.path[0],
          message: item.message,
        }
        errorData.push(error)
      })
      return response(res, false, errorData, "Validation failed", 422)
    }
    next()
  }
}

module.exports = {
  validateBody,
}
