/**
 * @file Server running APIbunny app, to launch to init maze
 * @author Nicolas Grenié <nicolas@3scale.net>
 */

var fortune = require("fortune");
var express = fortune.express;
var partials = require('express-partials');

var crypto = require('crypto')
  , key = 'easterbunny'

var container = express()
  , port = process.argv[2] || 3000;

//Fortune JS resources
var mazeAPI = fortune({
  db: "./db/maze-data",
  baseUrl: "http://apibunny.com"
});

mazeAPI.resource('maze',{
	name: String,
	cells: ['cell'],
	start: {ref: 'cell',inverse:'null'}
});

mazeAPI.resource('cell',{
	name: String,
	readableId: Number,
	north: {ref:'cell', inverse:'null'},
	east: {ref:'cell', inverse:'null'},
	south: {ref:'cell', inverse:'null'},
	west: {ref:'cell', inverse:'null'},
  abandon: String,
	exit_link: String,
	type: String,
	maze: {ref: 'maze'},
});

mazeAPI.resource('user',{
   twitter_handle: String,
   date: Date,
   hash: String,
   getprize: {ref: 'winning'}
}).transform(createHash);

//Express routes
container
  .use(mazeAPI.router)
  .listen(port);

console.log('Server running at http://127.0.0.1:'+port);

function createHash(request) {
  var resource = this;
  resource.hash = crypto.createHmac('sha1', key).update(resource.twitter_handle).digest('hex');
  resource.date = Date.now();
  resource.getprize = resource.hash;
  return resource;
}