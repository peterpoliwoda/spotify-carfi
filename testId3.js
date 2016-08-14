var id3 = require('id3js');

var nodeID3 = require('node-id3');

//var songPath = './Weezer - Test.mp3';
var fs = require('fs');

var folderContents = fs.readdirSync('./id3tags/');
console.log(folderContents);

for(song in folderContents){

console.log(folderContents[song]);

//tags.image is the path to the image (only png/jpeg files allowed)
var tags = {
  title: "NEW TAGS",
  artist: "ARTIST PETER",
  album: "ALBUMZITO"
}
var songPath = './id3tags/' + folderContents[song];
console.log('Tags before write \n'.yellow + tags);

id3({ file: songPath, type: id3.OPEN_LOCAL }, function(err, tags) {
	// tags now contains your ID3 tags
	if(err || (typeof tags === 'undefined') || tags.title == null){
 	  var id3success = nodeID3.write(tags, songPath);  	//Pass tags and filepath
	  console.log('Successful id3 tags write for song ' + songPath + ' : ' + id3success);
	}
	else {
		console.log('Song already has id3 tags.');
		console.log(tags);
	}
});
}
