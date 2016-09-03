var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
// eslint-disable-next-line
var colors = require('colors');
var config = require('./config.json');

var app = express();
app.use(bodyParser.text({type: 'text/html'}));

// POST fake download spotify songs
app.post('/carfi', function(req, res) {
    var list =
    'Ukeje - Film.mp3\n' +
    'Vixen - Falala.mp3\n' +
    'Weezer - Thank God For Girls.mp3';

    console.log(list);
    res.end(list);
});

var toDelete = function(contents) {
    var playlistFiles = fs.readdirSync(config.musicFolderPath);
    var deleteThose = '';
    for (var song in contents) {
        if (playlistFiles.indexOf(contents[song]) > -1 || contents[song] == '') {
            console.log(contents[song] + ' found in files.'.green);
        } else {
            console.log('Delete: '.red + contents[song]);
            deleteThose += contents[song] + '\n';
        }
    }
    return deleteThose;
};

var toDownload = function(contents) {
    var playlistFiles = fs.readdirSync(config.musicFolderPath);
    var downloadThose = '';
    for (var song in playlistFiles) {
        if (contents.indexOf(playlistFiles[song]) > -1) {
            console.log(playlistFiles[song] + ' already downloaded.'.grey);
        } else {
            console.log('Download: '.yellow + playlistFiles[song]);
            downloadThose += playlistFiles[song] + '\n';
        }
    }
    return downloadThose;
};

// POST carfi delete folder
app.post('/carfi/delete', function(req, res) {
    var folderContents = req.body.split(';');
    var deleteThose = toDelete(folderContents);
    res.end(deleteThose);
});

// POST carfi delete folder
app.post('/carfi/download', function(req, res) {
    var folderContents = req.body.split(';');
    var downloadThose = toDownload(folderContents);
    res.end(downloadThose);
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Carfi app listening at http://%s:%s', host, port);
});
