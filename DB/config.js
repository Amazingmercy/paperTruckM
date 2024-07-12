const mongoose = require('mongoose')
const asyncWrapper = require('../middlewares/asyncWrapper')



const connectDB = asyncWrapper(async (url) => {
    return mongoose.connect(url)
    
})

module.exports = connectDB