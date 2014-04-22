/**
 * @file Creates maze in database from a javascript file.
 * @author Nicolas Grenié <nicolas@3scale.net>
 */
 
var http = require('http');
var fs = require('fs');
var Sync = require('sync');
var folder = process.cwd()+'/data/';

var HOST = "localhost",
    PORT = 3000;
var BASE_URL = "http://"+HOST+":"+PORT;

var MAZE_SIZE = 5 //5x5 maze
var START_ID = 0;
var END_ID = 24;

var maze_name ="uber-maze";
var maze;

var cell_path = BASE_URL+"/cells/";
var maze_path = BASE_URL+"/mazes/";

Sync(function(){
	var start_time = Date.now();
	console.log("Start");
    var result = createMaze.sync(null, "Uber maze");
    maze = result.mazes[0];
    var rawMaze = getFileMaze(maze_name);

    //Add Cells
    addCellsToDb.sync(null,rawMaze,maze);

	var mazedb = getMazeDB.sync(null, maze.id);
    var db_cells = mazedb.mazes[0].links.cells;
     
    var maze_cells = rawMaze.cells;

    // Loop in cells to add neighbors
    for(var i=0;i<db_cells.length;i++){
    	var cell = httpGet.sync(null, "/cells",db_cells[i]).cells[0];
    	var maze_cell = maze_cells['cell'+cell.readableId];
    	var doors = maze_cell.doors;
    	var data =[];

    	//north
    	if(doors[0]===0){
    		var north_id = cell.readableId-1;
    		var neigborCell = maze_cells['cell'+north_id];
    		data.push({"op":"replace","path":"/cells/0/north","value":""+neigborCell.id+""});
    	}
    	//west
    	if(doors[1]===0){
    		var west_id = cell.readableId-MAZE_SIZE;
    		var neigborCell = maze_cells['cell'+west_id];
    		data.push({"op":"replace","path":"/cells/0/west","value":""+neigborCell.id+""});
    	}
    	//south
    	if(doors[2]===0){
    		var south_id = cell.readableId+1;
    		var neigborCell = maze_cells['cell'+south_id];
    		data.push({"op":"replace","path":"/cells/0/south","value":""+neigborCell.id+""});
    	}

    	//east
    	if(doors[3]===0){
    		var east_id = cell.readableId+MAZE_SIZE;
    		var neigborCell = maze_cells['cell'+east_id];
    		data.push({"op":"replace","path":"/cells/0/east","value":""+neigborCell.id+""});
    	}

    	//exit
    	if(cell.readableId===END_ID){ 
    		data.push({"op":"replace","path":"/cells/0/exit_link","value":'http://'+HOST+'/users [submit:twitter_handle]'});
    		data.push({"op":"replace","path":"/cells/0/type","value":"exit"});
    	}

    	if(data.length>0){
    		data = JSON.stringify(data);
	    	httpPatch.sync(null,'/cells',cell.id,data);
    	}

    }

    //Init start point
    var data = [{"op":"replace","path":"/mazes/0/start","value":maze_cells['cell0'].id}];
	httpPatch.sync(null,'/mazes',mazedb.mazes[0].id,JSON.stringify(data));

	console.log('End - executed in '+ (Date.now()-start_time)+"ms");
});


/**
* Retrieve specific maze from DB
* @param {string} id - ID of the maze in Database
* @param {function} cb - Callback
*/
function getMazeDB(id,cb){
	try{
		httpGet('/mazes',id,cb);
	}catch(ex){
		console.log(ex);
		return undefined;
	}
}

/**
* Add maze cells to maze resource
* @param {maze} mazeObject - The mazeObject extracted from .js file
* @param {resource} mazeDb - Maze object from fortune.js resource
* @param {function} cb - Callback
*/
function addCellsToDb(mazeObject,mazeDb,cb){
	var cells = mazeObject.cells;
	for(var i =0; i<Object.keys(cells).length;i++){
		var c = cells['cell'+i];
	    var newDbCell = createCell.sync(null, c,i,mazeDb);
	    c.id = newDbCell.cells[0].id;
	}
	cb(null,cells); //return new table of cells
}

/**
* Add cell to a maze in the database
* @param {cell} cell - Cell object read from .js file
* @param {string} id - ID of the cell in the maze
* @param {maze} maze - Maze object from DB
* @callback {function} cb - callback
*/
function createCell(cell, readable_id, maze, cb){
	try{
		var data = '{"cells":[{"name":"'+cell.title+'","readableId":"'+readable_id+'","maze":"'+maze.id+'","type":"cell","abandon":"http://apibunny.com/abandon"}]}'
		httpPost('/cells',data,cb);
	}catch(ex){
		console.log(ex);
		return undefined;
	}
}

/**
* Create maze in database
* @param {string} name - Name of the Maze
* @callback {function} cb - callback
*/
function createMaze(name,cb){
	try{
		var data ='{"mazes":[{"name":"'+name+'"}]}';
		httpPost('/mazes',data,cb);
	}catch(ex){
		console.log(ex);
		return undefined;
	}
}

/**
* Extract maze structure from a .js file
* @param {string} filename - Name of the Maze file
*/
function getFileMaze(filename) {
    try {
        return JSON.parse(fs.readFileSync(folder+filename+'.js'));
    }
    catch(ex) {
        return undefined;
    }
}

/**
* Function to perform a HTTP PATCH request
* @param {string} path - Endpoint to be called
* @param {string} integer - ID of the ressource to patch
* @param {json} data - Data to send 
* @param {function} cb - Callback
*/
function httpPatch(path,id,data,cb){
	var options = {
	    host: HOST,
	    port: PORT,
	    path: path+'/'+id,
	    method: 'PATCH',
	    headers: {
	      'Content-Type': 'application/json',
	      "Content-Length":Buffer.byteLength(data, 'utf-8')
		}
	};
	var req = http.request(options, function(response) {
	  response.setEncoding('utf8');
	  var res_data;
	  response.on('data', function (chunk) {
	    res_data = chunk;
	  });
	  response.on('end', function() {
		cb(null,JSON.parse(res_data));
	  });
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	req.write(data);
	req.end();
}

/**
* Function to perform a HTTP GET request
* @param {string} path - Endpoint to be called
* @param {string} integer - ID of the ressource
* @param {function} cb - Callback
*/
function httpGet(path,id,cb){
	var options = {
	    host: HOST,
	    port: PORT,
	    path: path+'/'+id,
	    method: 'GET',
	    headers: {
	      'Content-Type': 'application/json'
		}
	};

	var req = http.request(options, function(response) {
	  response.setEncoding('utf8');
	  var res_data;
	  response.on('data', function (chunk) {
	    res_data = chunk;
	  });
	  response.on('end', function() {
		cb(null,JSON.parse(res_data));
	  });
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});


	req.end();
}

/**
* Function to perform a HTTP POST request
* @param {string} path - Endpoint to be called
* @param {json} data - Data to send 
* @param {function} cb - Callback
*/
function httpPost(path,data,cb){
	var options = {
	    host: HOST,
	    port: PORT,
	    path: path,
	    method: 'POST',
	    headers: {
	      'Content-Type': 'application/json',
	    }
	};

	var httpreq = http.request(options, function (response) {
		response.setEncoding('utf8');
		var res_data;
		response.on('data', function (chunk) {
		  res_data = chunk;
		});
		response.on('end', function() {
		  cb(null,JSON.parse(res_data));
		});
	});

	httpreq.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});

	httpreq.write(data);
	httpreq.end();
}