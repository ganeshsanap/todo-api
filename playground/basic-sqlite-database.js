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

sequelize.sync({ force: true }).then(function(){
    console.log('Everything is sycned!');

    Todo.create({
        description: 'Go to the market'
    }).then(function(todo){
        return Todo.create({
            description: 'Clean the house'
        });
    }).then(function(){
        //return Todo.findByPk(1);
        return Todo.findAll({
            where : {
                description: {
                    [Op.like]: '%market%'
                }
            }
        })
    }).then(function(todos) {
        if (todos) {
            todos.forEach(function (todo){
                console.log(todo.toJSON());
            });
        } else {
            console.log('no todos found!');
        }
    }).catch(function(error) {
        console.log(error);
    });
});