var favicon = require('serve-favicon');
var frankenstein  = require('./content/settings.js');

module.exports = function(app,express){
  app.set("port", 8080); //Server's port number
  app.set("views", __dirname + "/views"); //Specify the views folder
  app.set("view engine", "jade"); //View engine is Jade
  app.use(express.static(__dirname + "/public")); //Specify where the static content is
  app.use(express.static(__dirname + "/content")); //Specify where the static content is
  // app.use(express.static(__dirname + "/content"));
	app.use(express.static(__dirname + '/content/'+frankenstein.folder));
  //app.use(express.bodyParser()); //Tells server to support JSON, urlencoded, and multipart requests
  //app.use(favicon(__dirname + '/public/images/favicon.ico'));
}