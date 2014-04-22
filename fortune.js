/**
 * @file Server running APIbunny app
 * @author Nicolas Grenié <nicolas@3scale.net>
 */

var fortune = require("fortune");
var express = fortune.express;
var partials = require('express-partials');
var keenio = require('express-keenio');;

var crypto = require('crypto')
  , key = 'YOUROWNKEY';

var container = express()
  , port = process.argv[2] || 3000;

//Layout and views
container.set('views', __dirname + '/views');
container.engine('html', require('ejs').renderFile);
container.set('view engine', 'ejs');
container.use(fortune.express.static(__dirname + '/public'));
container.use(partials());

//Env
var ENV='';
if(process.env.NODE_ENV)
  ENV="-"+process.env.NODE_ENV;

//Keen
keenio.configure({ client: {
    projectId: "PROJECT_ID",
    writeKey: "WRITE_KEY",
} });

keenio.on('error', console.warn);

//Fortune JS resources
var mazeAPI = fortune({
  db: "./db/maze-data",
  baseUrl: "http://apibunny.com"
});

mazeAPI.resource('maze',{
	name: String,
	start: {ref: 'cell',inverse:'null'}
}).readOnly();

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
}).readOnly();

mazeAPI.resource('user',{
   twitter_handle: String,
   date: Date,
   hash: String,
   getprize: {ref: 'winning'}
}).transform(createHash);

//Express routes
container
  .get('/cells',keenio.trackRoute('errorCollection'+ENV),function(req,res){
  	res.send(403, 'Nice try, not allowed');
  })
  .get('/users',keenio.trackRoute('errorCollection'+ENV),function(req,res){
  	res.send(403, 'Nice try, not allowed, tip: POST your twitter_handle');
  })
  .delete('/users/:id',keenio.trackRoute('errorCollection'+ENV),function(req,res){
    res.send(403, 'Dead end, my friend');
  })
  .patch('/users/:id',keenio.trackRoute('errorCollection'+ENV),function(req,res){
    res.send(403, 'Keep trying, but not here');
  })
  .post('/users/:anything',keenio.trackRoute('errorCollection'+ENV),function(req,res){
    res.send(400, 'Wrong direction buddy! That\'s not how your are supposed to do a POST request ;)');
  })
  .use(mazeAPI.router)
  .get('/', keenio.trackRoute('indexCollection'+ENV), function(req, res) {
    mazeAPI.adapter.awaitConnection().then(function () {
      maze = mazeAPI.adapter.findMany('maze');
    return maze;
  }).then(function (resource) {
      if(resource){
        res.render('index',{title: 'APIbunny quest', maze_id:resource[0].id, maze_name: resource[0].name, maze_start:resource[0].links.start});
      }else{
        res.status(404);
        res.send("Not found");
      }
    });
  })
  .get('/abandon',keenio.trackRoute('abandonCollection'+ENV), function(req, res) {
    res.render('abandon',{title: 'APIbunny abandon'});
  })
  .get('/dashboard',function(req,res){
    res.render('dashboard',{layout:'basic',title:"Dashboard"});
  })
  .get('/winnings/:hash', keenio.trackRoute('winningCollection'+ENV),function(req, res) {
    var user;
  	mazeAPI.adapter.awaitConnection().then(function () {
  	  user = mazeAPI.adapter.find('user', {hash:req.params['hash']});
	  return user;
	}).then(function (resource) {
  	  if(resource){
  	  	res.render('winning',{title: 'APIbunny found', username: resource.twitter_handle, url: "http://apibunny.com/winnings/"+resource.hash});
  	  }else{
  	  	res.send(404,"Not found");
  	  }
	  });
    
 }).listen(port);

console.log('Server running at http://127.0.0.1:'+port);


//Generate hash from twitter handle
function createHash(request) {
  var resource = this;
  resource.hash = crypto.createHmac('sha1', key).update(resource.twitter_handle).digest('hex');
  resource.date = Date.now();
  resource.getprize = resource.hash;
  return resource;
}