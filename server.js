var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

var todos = [];

var todoNextId = 1;

app.get('/', function (req, res) {
    res.send('TODO API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
    res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function (req, res) {
    //res.send('Asking for todo with id of ' + req.params.id);
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo;

    todos.forEach(function(todo){
        if(todo.id === todoId) {
            matchedTodo = todo;
        }
    });

    if(matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

// POST /todos
app.post('/todos', function (req, res) {
    var body = req.body;
    //console.log('description: ' + body.description);
    //console.log('completed: ' + body.completed);
    
    body.id = todoNextId++;

    todos.push(body);

    res.json(body);
});

app.listen(PORT, function () {
    console.log('Express listening on port ' + PORT + '!')
})