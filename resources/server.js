const express = require('express');
const expr = express();
const http = require('http').createServer(expr);
const io = require('socket.io')(http);
const path = require('path');
const cookieParser = require('cookie-parser');
//const redis = require('redis');
const session = require('express-session');
const cookie = require('cookie');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
var LocalStrategy = require('passport-local').Strategy;
const port = 3000;
var models = require('./models')
//var redisStore = require('connect-redis')(session)

//let redisClient = redis.createClient();
let sessionStore = new session.MemoryStore();

mongoose.connect('mongodb://localhost:27017/spotifind');

expr.use(bodyParser.json());
expr.use(bodyParser.urlencoded({ extended: true }));
expr.use(cookieParser());

expr.use(session(
    { 
        secret: 'monkeyfarts',
        cookie: { maxAge: 1000 * 60 * 60, },
        genid: function(req) {
            return uuidv4();
        },
        resave: false,
        store: sessionStore,
        username: null
    }));

expr.use(passport.initialize());
expr.use(passport.session());

passport.use(new LocalStrategy(
    function(username, password, done) {
        models.User.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false) }
            user.comparePasswords(password, function(err, isMatch) {
                if (err) { return done(err) }
                if (!isMatch) { return done(null, false) }
                if (isMatch) {
                    return done(null, user);
                }
            });
            
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.username);
});

passport.deserializeUser(function(username, done) {
        models.User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err) };
        return done(null, user);
    });
});

function authorizeUser(req, res, next) {
    console.log('hello');
    if (req.isAuthenticated() && req.session) {
        console.log(req.session)
        return next();
    }
    else {
        return res.redirect('/login');
    }
}

expr.get('/', authorizeUser, function(req, res) {
    console.log('authorized');
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

expr.use(express.static(path.join(__dirname, '../public')));
expr.use(express.static(path.join(__dirname, '../node_modules/socket.io-client/dist')));

expr.get('/login', function(req, res) {
    console.log('logging in')
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

expr.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
    req.session.username = req.body.username;
    res.redirect('/');
});

expr.get('/signup', function(req, res) {
    console.log('in signup');
    res.sendFile(path.join(__dirname, '../public', 'signup.html'));
});

expr.post('/signup', function(req, res) {
        models.User.findOne({ username: req.body.username }, function(err, user) {
        if (err) {
            return res.status(500).send('error!');
        }
        if (user) {
            return res.status(500).send('username taken');
        }
        else if (!user && req.body.username && req.body.password) {
            new models.User({ username: req.body.username, password_hash: req.body.password }).save(function (err, newUser) {
                if (err) {
                    return res.status(500).send('error!');
                }
                return res.redirect('/login');
            }
        )};
    });
});

//need to build error handling system for get and post methods... flash?

io.on('connection', function(socket) {

    console.log('a user connected');

    socket.on('connect', function() {
        console.log(io.engine.id);
    })

    socket.on('chat-message', function(msg) {
        var socksid = cookie.parse(socket.handshake.headers.cookie)['connect.sid']
        console.log('parsed cookie successfully: ' + socksid)
        var sid = socksid.substring(0, socksid.indexOf('.'));
        sid = sid.slice(-(sid.length - sid.indexOf(':') - 1));
        sessionStore.get(sid, function(err, session) {
            new models.Message({ text: msg, date_sent: Date.now(), user_id: session.username }).save(function(err) {
                if (err) {
                    console.log('couldnt save message');
                }
            });
            console.log(session.username);
            console.log('message: ' + msg);
            socket.emit('chat-message', session.username + ': ' + msg);
        })
    });

    socket.on('disconnect', function() {
        console.log('a user disconnected');
        socket.broadcast.emit('disconnect-msg', "a user disconnected");
    });
})

http.listen(port, function() {
    console.log('Server running...');
})