const client = require('../config/redis_db');
const bcrypt = require('bcrypt-nodejs');
var users = 1;
let root = (request, response) => {
	//console.log('root controller', request.client.req /*request.session.hasOwnProperty('loggedIn')*/);
	//if (request.hasOwnProperty(session)) {
		if (request.session.hasOwnProperty('loggedIn')) {
			response.redirect('/home');
		} else {
			response.render('index');
		};
	//} else {
		//response.render('index');
	//}
};

let signUpPage = (request, response) => response.render('signup');

let saveNewUser = (request, response) => {
	if(request.session.loggedIn){
		response.send('You need to log out first before signing up for a new account');
	} else {
		client.HGET('Users', request.body.email, (error, result) => {
			if (result) {
				console.log('User exists');
				response.redirect('/signup/new');
			} else {
				password = request.body.password;
				client.HSET('Users', request.body.email, hashPassword(password));
				request.session.loggedIn = true;
				request.session.email = request.body.email;
				response.render('home',{emails:''});
			};
		});		
	};
};

/////////////////

let hashPassword = (password) => {
	let hash = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
	return hash;
};

let validPassword = (password,hashedPassword) => {
	return bcrypt.compareSync(hashedPassword, password);
}

/////////////////

let login = (request, response) => {
	//if (!request.session.loggedIn){
		console.log('login controller');
		client.HGET('Users',request.body.email, (error, result) => {
			console.log(result);
			if (result){
				if(validPassword(result,request.body.password)) {
					request.session.loggedIn = true;
					request.session.email = request.body.email;
					response.redirect('/home');
				} else {
					response.redirect('/');
				} 
			} else {
				console.log('User doesn\'t exist');
				response.redirect('/');
			}
			
		});
	//} else {
		//response.redirect('/home');
	//}
	
};

let home = (request, response) => {
	client.KEYS('*:' + request.session.email , (error, results) => {
		console.log('in home controller', results);
		if (results.length) {
			var inbox = [];
			for (let i = 0; i < results.length; i++) {
				client.ZRANGE(results[i],0, -1, (error, messages) => {
					let messagesGroup = [];
					for (let j = 0; j < messages.length; j++){
						let message = {};
						message['message'+(j+1)] = messages[j];
						messagesGroup.push(message);
					};
					let userMessages = {};
					userMessages[results[i]] = messagesGroup;
					inbox.push(userMessages);
					if (i === (results.length -1)){
						response.render('home',{emails:JSON.stringify(inbox)});
						
					};
					
				});
				
			};
			
		} else {
			console.log("home controller");
			response.render('home',{emails:''});
		}
	})
};

let writeMessage = (request, response) => {
	client.HKEYS('Users', (error, users) => {
		users.splice(users.indexOf(request.session.email),1);
		console.log('users', users);
		response.render('sendMessage',{users:users});
	});
};

let saveMessage = (request, response) => {
	client.GET(request.session.email + ':' + request.body.to + ':count', (error, result) => {
		if (result){
			client.ZADD(request.session.email + ':' + request.body.to, result+1, request.body.message);
			client.INCRBY(request.session.email + ':' + request.body.to + ':count',1);
		} else {
			client.SET(request.session.email + ':' + request.body.to + ':count',2);
			client.ZADD(request.session.email + ':' + request.body.to, 1, request.body.message);
		};
	});
	console.log(request.sessionID);
	//response.send('saved');
	response.redirect('/home');
};

let logout = (request, response) => {
	request.session.destroy();
	response.redirect('/');
}
module.exports.root = root;
module.exports.signUpPage = signUpPage;
module.exports.saveNewUser = saveNewUser;
module.exports.login = login;
module.exports.home = home;
module.exports.logout = logout;
module.exports.writeMessage = writeMessage;
module.exports.saveMessage = saveMessage;