var Sequelize = require('sequelize');
const { Op } = require("sequelize");

var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {  
        type: Sequelize.STRING,
        allowNull :false,
        validate: {
            notEmpty: true,
            len: [1, 250]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
});

var User = sequelize.define('user', {
    email: {
        type: Sequelize.STRING,
    }
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync().then(function(){
    console.log('Everything is sycned!');

    // Add user and it's todo
    // User.create({
    //     email: 'ganeshs@example.com'
    // }).then(function () {
    //     return Todo.create({
    //         description: 'Clean yard',
    //         completed: false
    //     });
    // }).then(function(todo) {
    //     User.findByPk(1).then(function(user){
    //         user.addTodo(todo);
    //     })
    // });

    //fetch todos for user
    User.findByPk(1).then(function (user) {
        user.getTodos({
            where: {
                completed: false
            }
        }).then(function (todos) {
            todos.forEach(function (todo) {
                console.log(todo.toJSON());
            });
        });
    });
});