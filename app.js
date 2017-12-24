var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
app.use(bodyParser.json());
app.use(express.static(__dirname + '/client'));

// DB SETUP
MONGOLAB_URI = "mongodb://Joesepherus:ggnoreJOES5637@ds131137.mlab.com:31137/charted";

mongoose.connect(MONGOLAB_URI, function (error) {
	if (error) console.error(error);
	else console.log('mongo connected');
});

Song = require('./models/song.js');

//mongoose.connect('mongodb://localhost/todolist');
var db = mongoose.connection;

// 										SCHEDULER
// --------------------------------------------------------------------------------------------

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.minute = 1;

var j = schedule.scheduleJob(rule, function () {
	var obj = {
		table: []
	};
	url = 'https://www.billboard.com/charts/hot-100';

	request(url, function (error, response, html) {
		if (!error) {
			var $ = cheerio.load(html);
			var counter = 1;
			var title, release, rating;
			var json = { id: "", title: "", author: "" };

			$('.chart-row__title').each(function () {
				author = $(this).find('.chart-row__artist').first().text();
				author = author.replace(/(\r\n|\n|\r)/gm, "");

				json.author = author;
				title = $(this).find('.chart-row__song').first().text();
				json.title = title;
				//obj.table.push(json);
				obj.table.push(JSON.parse('{\n\t"id": "' + counter + '",\n\t"title": "' + json.title + '",\n\t"author": "' + json.author + '"\n}'));
				json.id = counter++;
			})
		}
		//console.log(obj.table);

		db.collection("songs").drop();
		console.log("songs deleted");

		db.collection("songs").insertMany(obj.table, function (err, r) {
			console.log("inserted songs");
		});

		fs.writeFile("test.json", obj.table, function (err) {
			if (err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		});
	})


});

// --------------------------------------------------------------------------------------------


// 										WEB PAGES SCRAPING
// --------------------------------------------------------------------------------------------


/*
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

//app.get('/scrape', function(req, res){

url = 'https://www.billboard.com/charts/hot-100';

request(url, function (error, response, html) {
	if (!error) {
		var $ = cheerio.load(html);

		var title, release, rating;
		var json = { title: "", release: "", rating: "" };

		// We'll use the unique header class as a starting point.

		$('.chart-row__artist').filter(function () {

			// Let's store the data we filter into a variable so we can easily see what's going on.

			var data = $(this);

			// In examining the DOM we notice that the title rests within the first child element of the header tag. 
			// Utilizing jQuery we can easily navigate and get the text by writing the following code:

			title = data.first().text();

			// Once we have our title, we'll store it to the our json object.

			json.title = title;
			console.log("LOL " + json.title);

		})
	}
})
//}) 
*/



/*var request = require("request");
var bodyHelp;

request({
	uri: "https://www.billboard.com/charts/hot-100",
}, function (error, response, body) {
	var fs = require('fs');
	fs.writeFile("test.txt", body, function (err) {
		if (err) {
			return console.log(err);
		}
	
		console.log("The file was saved!");
	});
	
});

console.log("lol " + bodyHelp);*/

// --------------------------------------------------------------------------------------------

// 											DATABASE
// --------------------------------------------------------------------------------------------

var db = mongoose.connection;

var fs = require("fs");

// display all tasks
app.get('/api/song', function (req, res) {
	Song.getAllSongs(function (err, allSongs) {
		if (err) {
			throw err;
		}
		res.json(allSongs);
	});
})

// display a song with a certain ID
app.get('/api/Song/:id', function (req, res) {
	Song.getSongById(req.params.id,
		function (err, song) {
			if (err) {
				throw err;
			}
			res.json(song);
		});
})

// add a new song
app.post('/api/Song', function (req, res) {
	var song = req.body;

	Song.addSong(song, function (err, song) {
		if (err) {
			throw (err);
			res.send({
				message: 'something went wrong'
			});
		}
		else {
			res.json(song);
		}
	});
})

// update a song
app.put('/api/Song/:id', function (req, res) {
	var id = req.params.id;
	var song = req.body;

	Song.updateSong(id, song, {},
		function (err, song) {
			if (err) {
				throw (err);
				res.send({
					message: 'something went wrong'
				});
			}
			else {
				res.json(song);
			}
		});
})

// remove song permanently
app.delete('/api/Song/deleted/:id', function (req, res) {
	var id = req.params.id;
	Song.deletePermanentlySong(id,
		function (err, song) {
			if (err) {
				throw (err);
				res.send({
					message: 'something went wrong'
				});
			}
			else {
				res.json(song);
			}
		});
})

// --------------------------------------------------------------------------------------------

// calling server to listen on port
var server = app.listen(process.env.PORT || 98, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("App listening at http://%s:%s", host, port);
})
