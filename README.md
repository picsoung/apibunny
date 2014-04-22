APIbunny
========

APIbunny was launched on Friday 18th April 2014 to celebrate Easter in a geeky manner.
Hackers were asked to solve a maze using an Hypermedia API to claim a prize.

Find the whole story here

Project by [@picsoung](http://github.com/picsoung) from [3scale](http://3scale.net) supported by [APItools](http://apitools.com)

## Live Demo
http://apibunny.com

## Dependencies
* [node](http://nodejs.org/)
* [npm](https://github.com/npm/npm)
* [fortune.js](http://fortunejs.com)
* [express-partials](https://github.com/publicclass/express-partials)
* [ejs](https://github.com/visionmedia/ejs)
* [crypto](https://www.npmjs.org/package/crypto)
* [express-keenio](https://github.com/sebinsua/express-keenio)
* [sync](https://github.com/0ctave/node-sync)

## How does it work

Maze data are stored in `/data` folder.
`fortune_init.js` launch the API with no restrictions
`mazes.js` reads the info from maze data file and call the API to create the maze in database
`fortune.js` launch the protected version of the API.

By default we use `nedb` check the [Fortune.js documentation](http://fortunejs.com/docs/) to change it.

Databases are stored in `/node_modules/data/db/maze-data`

## Config
To track calls in the API we use [Keen.io](http://keen.io) Analytics API. In `config.js` you will need to add your Keen.io keys to make it work.

You will also have to change `privateKey` variable to your own, it's used to generate a hash when users have finished the maze.

In this config file you can also configure the baseUrl of your API or the port where it will be available.

## Install

```shell
git clone https://github.com/picsoung/apibunny.git
cd apibunny
npm install
node fortune_init.js
```

in another terminal to create the maze
```shell
node mazes.js
```

Kill init and launch the "protected" version

```
node fortune.js
```

## Clients
In the community people have built their own client
