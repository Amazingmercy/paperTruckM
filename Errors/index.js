const CustomAPIError = require('./customAPI')
const unauthenticatedError = require('./unauthenticated')
const NotFoundError = require('./notFound')
const BadRequestError = require('./badRequest')
const unauthorized = require('./unauthorized')



module.exports = {
    CustomAPIError,
    unauthenticatedError,
    NotFoundError,
    BadRequestError,
    unauthorized
}