var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var bcrypt = require('bcrypt');

var db = require('./db.js');
const { where, bind, functions } = require('underscore');
 
var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

var todos = [];

var todoNextId = 1;

app.get('/', function (req, res) {
    res.send('TODO API Root');
});

// GET /todos?completed=true&q=work
app.get('/todos', function (req, res) {
    var query = req.query;
    var where = {};

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            [db.Op.like]: '%' + query.q + '%'
        }
    }

    db.todo.findAll({where: where}).then(function (todos){
        res.json(todos);
    }, function(e) {
        res.status(500).send();
    });

    //// Old implementation using static array
    // var filteredTodos = todos;

    // if (query.hasOwnProperty('completed') && query.completed === 'true') {
    //     filteredTodos = _.where(filteredTodos, { completed: true});
    // } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
    //     filteredTodos = _.where(filteredTodos, { completed: false});
    // }

    // if (query.hasOwnProperty('q') && query.q.length > 0) {
    //     filteredTodos = _.filter(filteredTodos, function (todo) {
    //         return todo.description.toLowerCase().indexOf(query.q.toLowerCase()) > -1;
    //     });
    // }

    //res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findByPk(todoId).then(function(todo) {
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, function (e) {
        res.status(500).send();
    });

    //var matchedTodo;

    //// search using underscore library for Static array
    //matchedTodo = _.findWhere(todos, {id: todoId});

    //// search using forEach on array
    // todos.forEach(function(todo){
    //     if(todo.id === todoId) {
    //         matchedTodo = todo;
    //     }
    // });

    // if(matchedTodo) {
    //     res.json(matchedTodo);
    // } else {
    //     res.status(404).send();
    // }
});

// POST /todos
app.post('/todos', function (req, res) {   
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo){
        res.json(todo.toJSON());
    }, function (e) {
        res.status(400).json(e);
    });

    //// Old implementation using static array
    // if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
    //     return res.status(400).send();
    // }

    // body.id = todoNextId++;
    // body.description = body.description.trim();

    // todos.push(body);
    // res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function(rowsDeleted){
        if (rowsDeleted === 0) {
            res.status(404).json({
                error: 'No record found with id'
            });
        } else {
            res.status(204).send();
        }
    }, function (e) {
        res.status(500).send();
    });

    //// Old implementation using underscore package
    // var matchedTodo = _.findWhere(todos, {id: todoId});

    // if(!matchedTodo) {
    //     res.status(404).json({"error": "No todo item found with given id"});
    // } else {
    //     todos = _.without(todos, matchedTodo);
    //     res.json(matchedTodo);
    // }
});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }
    
    db.todo.findByPk(todoId).then(function(todo){
        if (todo) {
            return todo.update(attributes).then(function(todo){
                res.json(todo.toJSON());
            }, function(e){
                res.status(400).json(e)
            });
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send(); 
    });

    //// Old implementation using underscore package
    // var matchedTodo = _.findWhere(todos, {id: todoId});
    // if (!matchedTodo) {
    //     return res.status(404).send();
    // }

    // if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    //     validAttributes.completed = body.completed;
    // } else if (body.hasOwnProperty('completed')) {
    //     res.status(400).send();
    // }

    // if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    //     validAttributes.description = body.description.trim();
    // } else if (body.hasOwnProperty('description')) {
    //     res.status(400).send();
    // }

    // _.extend(matchedTodo, validAttributes);

    // res.json(matchedTodo);
    
});

//// GET /users?q=ganeshs
// app.get('/users', function(req, res) {
//     var query = req.query;
//     var where = {};

//     if (query.hasOwnProperty('q') && query.q.length > 0) {
//         where.email = {
//             [db.Op.like]: '%' + query.q + '%'
//         }
//     }

//     db.user.findAll({where: where}).then(function (users){
//         res.json(users);
//     }, function(e) {
//         res.status(500).send();
//     });
// });


// GET /users/:id
app.get('/users/:id', function(req, res) {
    var userId = parseInt(req.params.id, 10);

    db.user.findByPk(userId).then(function(user) {
        if (!!user) {
            res.json(user.toPublicJSON());
        } else {
            res.status(404).send();
        }
    }, function (e) {
        res.status(500).send();
    });

});

// POST /users
app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user){
        res.json(user.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    });
});

// POST/users/login
app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body).then(function(user){
        var token = user.generateToken('authentication');
        if(token) {
            res.header('Auth', token).json(user.toPublicJSON());
        } else {
            res.status(401).send();
        }
    }, function(e){
        res.status(401).send();
    });
});

db.sequelize.sync({ force: true }).then(function(){
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
});