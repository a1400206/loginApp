var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

//Init App
var app = express();
var http = require('http');
var server = http.createServer(app);

//socket io stuff

var io = require('socket.io')(server);


// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

//BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//Passport init
app.use(passport.initialize());
app.use(passport.session());


//Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', users);

app.use('/', routes);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || 3000));

server.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});



///////stuff
/*Leo Jäppinen, Emilia Salo, Juho Rannikka*/

//var app = require('express')();

//var port = process.env.PORT || 3000;
var users = {};

d = new Date(new Date().getTime()).toLocaleTimeString();
//
//app.get('/', function(req, res) {
//	res.sendFile(__dirname + '/index.html');
//});

//Notification from connected/disconnected users
	io.on('connection', function(socket) {
	console.log('a user connected');
	socket.on('disconnect', function() {
	io.emit('new message', 'user ' + socket.name + ' has left the building');
	console.log('user ' + socket.name + ' disconnected');
	});

});

//Add user
	io.sockets.on('connection', function(socket) {
	socket.on('new user', function(msg, callback) {
		if (msg in users) {
			callback(false);
		} else {
			callback(true);
			socket.nameTextField = msg;
			users[socket.nameTextField] = socket;
			updateNicknames();

		}
		io.emit('registermsg', 'user ' + msg + ' joined');
		console.log('user ' + msg + ' registered');
		socket.name = msg;
		// users[socket.name] = socket;
	});
	
	function updateNicknames(){
		io.sockets.emit('usernames', Object.keys(users));
	}
	
	socket.on('disconnect', function(msg){
		if(!socket.nameTextField) return;
		delete users[socket.nameTextField];
		updateNicknames();
	});
	
	
	
	socket.on('send message', function(msg, callback) {
		console.log('sending message');
		console.log('this is the name: ' + socket.name);
		//adding whisper function
		if(msg.substr(0,3) === '/w '){
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if(ind !== -1) {
				var name = msg.substring(0, ind);
				var msg = msg.substring(ind + 1);
				if(name in users){
					JSON.stringify({msg});
					users[name].emit('whisper', d.toLocaleString() + ' ' + socket.nameTextField + " whispered to you: " + msg );
					console.log('whisper');
					console.log(Object.keys(users));
					console.log('whisper', {msg: msg, nick: socket.nameTextField});
				}else{
					//when wrong username is inserter
					callback('Error! Enter a valid user.');
				}
				
			}else{
				//when no message is written
				callback('Error! Please enter a message.');
			}
			
		}else{

	console.log(d.toLocaleString());
	io.sockets.emit('new message', d.toLocaleString() + ' ' + socket.name + ' said: ' + msg);
	console.log(socket.name + ' said: ' + msg);
		}
	});
	
});
//	
//	
//
//	
//	
//	
////List of participants
///* insert code here */
//	
//	
//	
//Chat functions
	io.on('connection', function(socket) {

});
	


//What port the application uses
//http.listen(port, function() {
//	console.log('listening on *:' + port);
//});
