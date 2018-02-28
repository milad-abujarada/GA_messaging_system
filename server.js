const app = require('express')();
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const routes = require('./config/routes');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const client = require('./config/redis_db');
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	key:'redis-projectID',
	secret:'redisProject',
	store: new redisStore({
		client: client,
		saveUninitialized: true,
		resave: false
	})
}));

app.use((request, response, next) => {
	console.log('request in app.use in server.js==========>',request);
	if ((request.originalUrl !== '/') && (request.originalUrl !== '/signup/new') && (request.originalUrl !== '/login')) {
		console.log('session ID', request.sessionID);
		client.GET("sess:" + request.sessionID, (error, result) => {
			let sessionInfo = JSON.parse(result);
			console.log('in server.js', sessionInfo, '===>>>', result);
			if (sessionInfo) {
				sessionInfo.hasOwnProperty('loggedIn')? next() : response.redirect('/'); 
			} else {
				response.redirect('/');
			}
			
		});
	} else {
		next();
	};
});

app.use((request, response, next) => {
	console.log('HIT');
	next();
});
app.use(routes);

app.listen(PORT, () => console.log('Backend server up and running'));