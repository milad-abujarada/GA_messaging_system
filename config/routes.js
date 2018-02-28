const router = require('express').Router();
const controllers = require('../controllers/controllers');

router.route('/')
	.get(controllers.root);

router.route('/signup/new')
	.get(controllers.signUpPage)
	.post(controllers.saveNewUser);

router.route('/login')
	.post(controllers.login);

router.route('/home')
	.get(controllers.home);

router.route('/logout')
	.get(controllers.logout);

router.route('/message/new')
	.get(controllers.writeMessage)
	.post(controllers.saveMessage);

module.exports = router;