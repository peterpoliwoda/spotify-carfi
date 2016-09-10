var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
// eslint-disable-next-line
var colors = require('colors');
var config = require('./config.json');

var app = express();
app.use(bodyParser.text({type: 'text/html'}));

// GET carfi playlist folder
app.get('/carfi/', function(req, res) {
    fs.readdir(config.musicFolderPath, function(err, musicFolder) {
        var folderContents = '## Car-Fi Playlist ##\n';
        for (var i in musicFolder) {
            folderContents += musicFolder[i] + '\n';
        }
        folderContents += '\nTotal: ' + musicFolder.length + '\n'
          + 'Last updated: ' + new Date(Date.now()).toLocaleString();
        res.end(folderContents);
    });
});

// GET carfi playlist folder
app.get('/carfi/car', function(req, res) {
    fs.readFile('carfi.car', function(err, currentCarfiPlaylist) {
        res.end(currentCarfiPlaylist);
    });
});

var toDelete = function(contents) {
    var playlistFiles = fs.readdirSync(config.musicFolderPath);
    var deleteThose = '';
    for (var song in contents) {
        if (playlistFiles.indexOf(contents[song]) > -1 || contents[song] == ''
        || contents[song].indexOf('.mp3') === -1) {
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
        if (contents.indexOf(playlistFiles[song]) > -1 || playlistFiles[song].indexOf('.mp3') === -1) {
            console.log(playlistFiles[song] + ' already downloaded.'.grey);
        } else {
            console.log('Download: '.yellow + playlistFiles[song]);
            downloadThose += playlistFiles[song] + '\n';
        }
    }
    return downloadThose;
};

var saveCarFiPlaylist = function(contents) {
    var currentCarfiPlaylist = '## What\'s in the car ##\n';
    for (var song in contents) {
        currentCarfiPlaylist += contents[song] + '\n';
    }
    currentCarfiPlaylist += '\nTotal: ' + contents.length + '\n'
      + 'Last updated: ' + new Date(Date.now()).toLocaleString();
    res.end(folderContents);

    fs.writeFile('carfi.car', currentCarfiPlaylist, function(err) {
        if (err) { return console.log(err); }
    });
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
    saveCarFiPlaylist(folderContents);
    res.end(downloadThose);
});

app.use('/music', express.static('music'));

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Carfi app listening at http://%s:%s', host, port);
});
