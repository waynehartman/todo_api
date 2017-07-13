/**
 *
 * "mongojs": "2.4.0",
 	"mongoose": "^4.11.1",
 	"restify": "4.3.0",
 */


var restify = require("restify");
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/todo:27017');

var TODO = mongoose.model('TODO', mongoose.Schema({
	title: String,
	completed: Boolean
}));

var server = restify.createServer({
	name : "todo_api"
});
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.gzipResponse());
server.use(restify.CORS());

var service_version = "0.0.1";

var http = {
	address : "0.0.0.0",
	port: 8080
};

server.listen(http.port, http.address, function() {
	console.log('Server listening on ' + http.address + ":" + http.port);
});


var TODO_PATH = "/todo";
var CREATE_TODO = TODO_PATH;
var GET_TODO = TODO_PATH;
var UPDATE_TODO = TODO_PATH + "/:_id";
var DELETE_TODO = TODO_PATH + "/:_id";

server.get({ path : GET_TODO, version : service_version }, function(req, res, next){
	TODO.find(function (err, todos) {
		if (err !== null) {
			res.send(500, err);
			return;
		}

		res.send(200, todos);
	});

	return next();
});

server.post({ path : CREATE_TODO, version : service_version }, function(req, res, next){
	let params = req.params;

	let todo = new TODO({
		title: params.title,
		completed: false
	});

	todo.save(function(err) {
		if (err !== null) {
			res.send(500, err);
			return;
		}

		res.send(201, todo);
	});

	return next();
});

server.put({ path : UPDATE_TODO, version : service_version }, function(req, res, next) {
	let params = req.params;

	let id = params._id;
	let title = params.title;
	let completed = params.completed;

	TODO.findOne({_id : id}, function(err, todo) {
		if (err !== null) {
			res.send(500, err);
			return;
		}

		if (!todo) {
			res.send(404, {});
			return;
		}

		todo.title = title;
		todo.completed = completed;

		todo.save(function(err) {
			if (err !== null) {
				res.send(500, err);
				return;
			}

			res.send(200, todo);
		});
	});

	return next();
});

server.del({ path : DELETE_TODO, version : service_version }, function(req, res, next){
	let params = req.params;
	let id = params._id;

	TODO.findOne({_id: id}, function(err, todo) {
		if (err !== null) {
			res.send(500, err);
			return;
		}

		if (!todo) {
			res.send(404, {});
			return;
		}

		todo.remove(function (err) {
			if (err !== null) {
				res.send(500, err);
				return;
			}

			res.send(202, {});
		});
	});

	return next();
});

