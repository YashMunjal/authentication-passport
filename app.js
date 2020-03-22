const express = require('express');
const expressLayouts=require('express-ejs-layouts');
const app=express();
const port = process.env.PORT || 5000;
const mongoose=require('mongoose');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session'); 
const passport=require('passport');

require('./config/passport')(passport)
//DB config
const db=require('./config/keys').MongoURI;
//Mongoose Set

mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
//static
app.use(express.static(path.join(__dirname, 'public')));
//connect to mongoDB
mongoose.connect(db)
.then(()=>console.log('Mongo Connected..!!'))
.catch(err =>console.log(err));
//ejs view engine
app.use(expressLayouts);
app.set('view engine','ejs'); 
app.set('views', path.join(__dirname, 'views'));

//Body parser MiddleWare

app.use(express.urlencoded({extended:true}))

//Express Session
app.use(session({
    secret:'secret',
    resave:true,
    saveUninitialized:true
}))
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect middleware to use flash
app.use(flash());

//Global variables for flash
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });
//Routing
app.use('/',require('./routes/index'));
app.use('/users',require('./routes/users'));

app.listen(port ,console.log('Server Started'));