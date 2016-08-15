/**
 * This is an example of a Spotify playlist downloader; only for convenience
 * purposes, to listen to your favorite music in the car. Make sure you own
 * the playlist contents before downloading them using this tool.
 *
 * For more information, read
 * http://www.peterpoliwoda.me
 */

var config = require('./config.json');
var dl = require('./YTDownloader');
var ytSearch = require('youtube-search');
var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
// eslint-disable-next-line
var colors = require('colors');

// Global playlist var used to save _playlistData.json file
var globalPlaylist;

getSpotifyPlaylist(function(error, spotifyPlaylist) {
    console.log('Reading the data file.'.blue);
    getLocalPlaylistData(spotifyPlaylist, function(err, localPlaylistData) {
        if (err) { throw err; }
        checkIfDownloaded(localPlaylistData, spotifyPlaylist, function(err, localPlaylistData) {
            globalPlaylist = localPlaylistData;
            for (var id in localPlaylistData) {
                if (localPlaylistData[id].downloaded === false) {
                    searchPleer({
                        spotifyId: id,
                        title: localPlaylistData[id].artists + localPlaylistData[id].title,
                        filename: localPlaylistData[id].filename
                    }, function(notFound, pleerData) {
                        if (notFound) {
                            ytSearch(notFound.songTitle, config.youtube, function(err, results) {
                                if (err || results.length === 0) {
                                    console.log('Song not found on YouTube either:'.yellow, err);
                                } else if (results.length > 0) {
                                    dl.getMP3({
                                        videoId: results[0].id,
                                        name: notFound.filename
                                    }, function(err, res) {
                                        if (err) {
                                            throw err;
                                        } else {
                                            console.log('YouTube: ' + results[0].title
                                              + ' was downloaded: ' + res.file);
                                            updatePlaylistDataAfterDownload(notFound.spotifyId);
                                        }
                                    });
                                }
                            });
                        } else {
                            downloadFromPleer(pleerData, function(err, pleerData) {
                                if (err) {
                                    console.log('Error on downloading from Pleer', err);
                                }
                                console.log('Downloaded from Pleer:'.magenta, pleerData.filename);
                                updatePlaylistDataAfterDownload(pleerData.spotifyId);
                            });
                        }
                    });
                } else {
                    console.log(('Skipping:' + localPlaylistData[id].filename).grey);
                }
            }
        });
    });
});

function getSpotifyPlaylist(callback) {
    const auth = 'Basic ' + new Buffer(config.spotify.clientId +
    ':' + config.spotify.clientSecret).toString('base64');

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {grant_type: 'client_credentials'},
        json: true,
        headers: {Authorization: auth}
    };
    request.post(authOptions, function(error, response, body) {
        if (error) {
            callback(error, null);
        } else if (!error && response.statusCode === 200) {
            var options = {
                url: 'https://api.spotify.com/v1/users/' +
                  config.spotify.userId + '/playlists/' +
                  config.spotify.publicPlaylistId + '/tracks',
                headers: {
                    'Authorization': 'Bearer ' + body.access_token
                },
                json: true
            };
            request.get(options, function(error, response, playlist) {
                if (error) {
                    console.log('Error getting playlist', error);
                    callback(error, null);
                } else {
                    callback(null, getPlaylistObject(playlist));
                    return;
                }
            });
        }
    });
}

// Looping through Spotify playlist contents returns playlistObject
function getPlaylistObject(playlistResponse) {
    var myPlaylist = {};
    for (var song = 0; song < playlistResponse.items.length; song++) {
        console.log('#' + (song + 1) + ' ----- ' + playlistResponse.items[song].track.name);
        var artists = '';
        for (var artist in playlistResponse.items[song].track.artists) {
            artists = artists + playlistResponse.items[song].track.artists[artist].name + ' ';
        }
        var myPlaylistObj = {
            artists: artists,
            title: playlistResponse.items[song].track.name,
            image: playlistResponse.items[song].track.album.images[1].url,
            // downloaded: false,
            filename: artists + '- ' + playlistResponse.items[song].track.name + '.mp3',
            timestamp: new Date().toISOString()
            // deleteSong: false
        };
        myPlaylist[playlistResponse.items[song].track.id] = myPlaylistObj;
    }
    return myPlaylist;
}

// Returning playlistData.json or full playlist with downloaded flag equal false
function getLocalPlaylistData(spotifyPlaylist, callback) {
    fs.readFile(config.musicFolderPath + '_playlistData.json',
      function(err, playlistDataFile) {
          if (err) {
              if (err.code == 'ENOENT') {
                  for (var song in spotifyPlaylist) {
                      spotifyPlaylist[song].downloaded = false;
                  }
                  fs.writeFile(config.musicFolderPath + '_playlistData.json',
                      JSON.stringify(spotifyPlaylist), function(err) {
                          if (err) {
                              callback(err, null);
                              throw err;
                          } else {
                              console.log('New data file created!');
                              callback(null, spotifyPlaylist);
                          }
                      });
              } else {
                  callback(err, null);
                  throw err;
              }
          } else {
              var localPlaylistFile = JSON.parse(playlistDataFile);
              callback(null, deleteRemovedSongsReturnFile(localPlaylistFile, spotifyPlaylist));
          }
      });
}

// Delete song files that are not on the Spotify playlist any more
function deleteRemovedSongsReturnFile(localPlaylistFile, spotifyPlaylist) {
    for (var spotifyId in localPlaylistFile) {
        if (localPlaylistFile.hasOwnProperty(spotifyId)) {
            if (!spotifyPlaylist.hasOwnProperty(spotifyId)) {
                localPlaylistFile[spotifyId].deleteSong = true;
                console.log(('Deleting: '.red + localPlaylistFile[spotifyId].title).red);

                // Remove the file that has been removed from the playlist
                fs.unlink(config.musicFolderPath + localPlaylistFile[spotifyId].fileName,
                  function(err) {
                      if (err) {
                          console.error('Error: file could not be removed.'.red);
                      }
                      delete localPlaylistFile[spotifyId];
                  });
            }
        }
    }
    fs.writeFile(config.musicFolderPath + '_playlistData.json',
      JSON.stringify(localPlaylistFile),
        function(err) {
            if (err) {
                console.log('Problem writing to playlist file after deleting songs', err);
                throw err;
            } else {
                console.log('Local data file updated with deleted songs.');
            }
        });
    return localPlaylistFile;
}

/* For each item in the current Spotify playlist, check if
there are songs that need to be downloaded  */
function checkIfDownloaded(localPlaylistFile, spotifyPlaylist, callback) {
    try {
        for (var spotifyId in spotifyPlaylist) {
            if (spotifyPlaylist.hasOwnProperty(spotifyId)) {
                if (!localPlaylistFile.hasOwnProperty(spotifyId)) {
                    localPlaylistFile[spotifyId] = spotifyPlaylist[spotifyId];
                    localPlaylistFile[spotifyId].downloaded = false;
                }
            }
        }
        callback(null, localPlaylistFile);
    } catch (err) {
        callback(err, null);
    }
}

function searchPleer(song, callback) {
    var pleerSearchPhrase = encodeURIComponent(song.title.replace(new RegExp('[ ]', 'g'), '+'));
    request.get(config.pleer.searchUrl + pleerSearchPhrase,
        function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var $ = cheerio.load(body);
                var pleerSongId = $('ol.scrolledPagination li').attr('link');
                if (typeof pleerSongId != 'undefined') {
                    if (typeof pleerSongId === 'string') {
                        callback(null, {
                            id: pleerSongId,
                            spotifyId: song.spotifyId,
                            filename: song.filename
                        });
                    } else {
                        callback(null, {
                            id: pleerSongId[0].toString(),
                            spotifyId: song.spotifyId,
                            filename: song.filename
                        });
                    }
                } else {
                    callback({
                        spotifyId: song.spotifyId,
                        songTitle: song.title,
                        filename: song.filename,
                        error: 'Not found on Pleer'}, null);
                }
            } else if (error) {
                console.log('Unexpected error when searching pleer'.red + song.title);
                callback({spotifyId: song.spotifyId,
                          songTitle: song.title,
                          filename: song.filename,
                          error: 'Not found on Pleer'}, null);
            }
        });
}

function downloadFromPleer(pleerData, callback) {
    request(config.pleer.getUrl + '?action=download&id=' + pleerData.id, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log('PLEER: Downloading ' + pleerData.filename + '...');
            request(JSON.parse(body).track_link)
              .pipe(fs.createWriteStream(config.musicFolderPath + pleerData.filename))
              .on('error', function(err) {
                  console.log('ON error');
                  callback(err, null);
              })
              .on('close', function() {
                  callback(null, pleerData);
              });
        } else {
            console.log('POST error', error);
            console.log('response', response);
            callback(error, null);
        }
    });
}

function updatePlaylistDataAfterDownload(spotifyId) {
    globalPlaylist[spotifyId].downloaded = true;
    fs.writeFile(config.musicFolderPath + '_playlistData.json',
        JSON.stringify(globalPlaylist),
            function(err) {
                if (err) {
                    console.log('Problem writing to playlist file after downloading song:' + spotifyId, err);
                    throw err;
                } else {
                    console.log('Local data file updated with downloaded song.', spotifyId);
                }
            });
}
