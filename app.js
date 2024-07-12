require('dotenv').config()
require('express-async-errors')
const express = require('express')
const cookieParser = require('cookie-parser');
const app = express()
const connectDB = require('./DB/config')
mongoURI = process.env.MONGO_URI


//Middlewares
const errorHandler = require('./middlewares/errorHandler')
const notFound = require('./middlewares/notFound')
const asyncWrapper = require('./middlewares/asyncWrapper')
const authenticate = require('./middlewares/authenticate')


//Routes
const authRoutes = require('./Routes/authRoutes')
const userRoutes = require('./Routes/userRoutes')

// Set EJS as the view engine
app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));


app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(authRoutes)
app.use(authenticate, userRoutes)


app.use(errorHandler)
app.use(notFound)



const port = process.env.PORT || 4900
const start = asyncWrapper(async()=> {
    await connectDB(mongoURI)
    app.listen(port, console.log(`Server is running on port http://localhost:${port}`));
})


start()