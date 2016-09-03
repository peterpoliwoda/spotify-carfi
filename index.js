var express = require('express');
var bodyParser = require('body-parser');
var carfiFile = require('./carfi.server.json');
var fs = require('fs');
// eslint-disable-next-line
var colors = require('colors');

var config = require('./config.json');

var app = express();
app.use(bodyParser.text({type: 'text/html'}));

// GET download spotify songs
app.get('/carfi', function(req, res) {
    console.log(carfiFile);
    res.json(carfiFile);
});

var toDelete = function(contents) {
    var playlistFiles = fs.readdirSync(config.musicFolderPath + '_server');
    var deleteThose = [];
    for (var song in contents) {
        if (playlistFiles.indexOf(contents[song]) > -1 || contents[song] == '') {
            console.log(contents[song] + ' found in files.'.green);
        } else {
            console.log('Delete: '.red + contents[song]);
            deleteThose.push(contents[song]);
        }
    }
    return deleteThose;
};

var toDownload = function(contents) {
    var playlistFiles = fs.readdirSync(config.musicFolderPath + '_server');
    var downloadThose = [];
    for (var song in playlistFiles) {
        if (contents.indexOf(playlistFiles[song]) > -1) {
            console.log(playlistFiles[song] + ' already downloaded.'.grey);
        } else {
            console.log('Download: '.yellow + playlistFiles[song]);
            downloadThose.push(playlistFiles[song]);
        }
    }
    return downloadThose;
};

// POST carfi folder
app.post('/carfi', function(req, res) {
    var folderContents = req.body.split(';');
    console.log(folderContents);
    var deleteThose = toDelete(folderContents);
    var downloadThose = toDownload(folderContents);

    var response = {
        message: 'Request received',
        delete: deleteThose,
        download: downloadThose
    };
    res.json(response);
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Carfi app listening at http://%s:%s', host, port);
});
