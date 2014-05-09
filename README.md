APIbunny
========

APIbunny was launched on Friday 18th April 2014 to celebrate Easter in a geeky manner.
Hackers were asked to solve a maze using an Hypermedia API to claim a prize.

Find the whole story on [3scale blog](http://www.3scale.net/2014/04/building-apibunny-using-fortune-js-jsonapi)

Project by [@picsoung](http://github.com/picsoung) from [3scale](http://3scale.net) supported by [APItools](http://apitools.com) using [Fortune.js](http://fortunejs.com) and [JSONAPI](http://jsonapi.org) inspired by [Mike Amundsen's](https://twitter.com/mamund) book [RESTful Web APIs](http://www.amazon.com/gp/product/1449358063/ref=as_li_qf_sp_asin_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1449358063&linkCode=as2&tag=nicolasgcom-20)

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
In the community people have built their own client, thanks to them for sharing

* [Tiborvass](https://github.com/tiborvass) in Go - [source](https://github.com/tiborvass/apibunny)
* [Dyokomizo](https://github.com/dyokomizo) in Bash - [source](https://github.com/dyokomizo/apibunny)
* [Jschmid](https://github.com/jschmid/) in Node - [source](https://github.com/jschmid/APIBunnySolver)
* [Estoner](https://github.com/estoner) using Ember.js - [source](https://github.com/estoner/apibunny-client)
* [Mikz](https://gist.github.com/mikz) in Javascript - [source](https://gist.github.com/mikz/a67c266c11ab62d99246)
* [Lalyos](https://github.com/lalyos) in 140 char Bash [source](https://gist.github.com/lalyos/11314322)
* [Rekyt](https://github.com/Rekyt) in Python - [source](https://github.com/Rekyt/apibunny)
