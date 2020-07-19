var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var db = require('./db.js');
 
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
    var filteredTodos = todos;
    var queryParams = req.query;

    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, { completed: true});
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, { completed: false});
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function (todo) {
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }

    res.json(filteredTodos);
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
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if(!matchedTodo) {
        res.status(404).json({"error": "No todo item found with given id"});
    } else {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }
});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if (!matchedTodo) {
        return res.status(404).send();
    }

    var body = _.pick(req.body, 'description', 'completed');

    var validAttributes = {};

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description.trim();
    } else if (body.hasOwnProperty('description')) {
        res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);

    res.json(matchedTodo);
    
});

db.sequelize.sync().then(function(){
    app.listen(PORT, function () {
        console.log('Express listening on port ' + PORT + '!');
    });
});