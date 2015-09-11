
var app = require('./server-config.js');
var database = require('./db/orm-model.js');

app.set('port', process.env.PORT || 8080);
app.listen(app.get('port'));

console.log('Server listening on port ', app.get('port'));
