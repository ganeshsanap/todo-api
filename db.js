var env = process.env.NODE_ENV || 'development';

var Sequelize = require('sequelize');
const { Op } = require("sequelize");

var sequelize;
if (env === 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        'dialect': 'postgres',
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/dev-todo-api.sqlite'
    });

}

var db = {};

//db.todo = sequelize.import(__dirname + '/models/todo.js');
db.todo = require(__dirname + '/models/todo.js')(sequelize, Sequelize);
db.user = require(__dirname + '/models/user.js')(sequelize, Sequelize);

db.sequelize = sequelize;
db.Op = Op;
db.Sequelize = Sequelize;

module.exports = db; 