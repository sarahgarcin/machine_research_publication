var _ = require("underscore");
var url = require('url')
var fs = require('fs-extra');


module.exports = function(app,io,m){

  /**
  * routing event
  */
  app.get("/", getIndex);
  app.get("/dodoc", getDodoc);

  /**
  * routing functions
  */

  // GET
  function getIndex(req, res) {
    res.render("index", {title : "Frankenstein Bot"});
  };

  function getDodoc(req, res) {
    res.render("dodoc", {title : "Frankenstein Bot | Dodoc"});
  };

};
