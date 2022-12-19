//Module Imports 




const express = require('express')
const bodyParser = require('body-parser')
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDbStore = require('connect-mongo')(session);
const csrf = require('csurf');
const flash =require('connect-flash') ;
const multer = require('multer');

// Custom imports
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const Errors= require('./controllers/erorr');
const User = require('./models/user');
const compression = require('compression');



const MONGODB_URI ="mongodb+srv://vedant:bakabhai@bookshop.jhfkr.mongodb.net/shop?retryWrites=true&w=majority "
const csrfProtection = csrf();
const fileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    },
})
const fileFilter=(req,file,cb)=>{
    if(file.mimetype==='image/png'
    || file.mimetype==='image/jpg'
    || file.mimetype==='image/jpeg'){
        cb(null,true)
    }
    else{
        cb(null,false)
    }
}

/************************  Middlewares *****************************/

const app = express()
const store = new mongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})
app.set('view engine', 'ejs')
app.set('views', 'views')
/******************ONLY for Production************* */
app.use(compression())
//Parsers
app.use(bodyParser.urlencoded({ extended: false }))
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'))

//Adding session
app.use(session({
    secret: 'mysecrectiambakabhai',
    resave: false,
    saveUninitialized: false,
    store: store
})
)

// CRSF PROCTECTION MIDLLEWARE
app.use(csrfProtection)

//Adding Flash 
app.use(flash())
app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next()
            }
            req.user = user;
            next()
        })
        .catch(err => {
            // console.log(err)
            next(new Error(err))
        });
});

// passing Crsf token and other varibles to all views 
app.use((req,res,next)=>{
    res.locals.isAuth=req.session.isLoggedIn
    res.locals.csrfToken=req.csrfToken()
    next()
})

app.use('/admin', adminRoutes.routes)
app.use(shopRoutes)
app.use(authRoutes)
/**************************************************PATH DIRECTORS************************************************************************************ */
app.use(express.static(path.join(__dirname, './', 'public')))
app.use('/images',express.static(path.join(__dirname, './', 'images')))

app.get('/500',Errors.E_500)
app.use(Errors.E_404)
app.use((error,req,res,next)=>{
    console.log('error', error)
    res.redirect('/500')
})

mongoose.connect(MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT||3000)
    }).catch(error=>{console.log(error)});
