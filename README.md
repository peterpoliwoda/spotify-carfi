# Car-Fi Spotify (Mac)

Download your favourite Spotify playlist contents.


## Prerequisites

To use Car-Fi Spotify you will need ffmpeg.
The simplest way to install ffmpeg on Mac OS X is with [Homebrew](http://mxcl.github.com/homebrew/).

Once you have Homebrew installed install ffmpeg from the Terminal with the following:
```
$ brew install ffmpeg
```

### Spotify

Create a new Spotify Application and get the ClientID and ClientSecret.    
https://developer.spotify.com/my-applications/#!/applications    

### YouTube
You will need a YouTube API v3 key:
https://developers.google.com/youtube/v3/getting-started


## Configuration

Before use you will need to update the **config.json** file with:    

 * **FFMPEG path:** path to ffmpeg installed either with brew or as a binary
  * brew default:    
  */usr/local/Cellar/ffmpeg/[CURRENT_VERSION]/bin/ffmpeg*
 * **YouTube key:** Used to call the YouTube API
 * Spotify:
    * **API ClientID**
    * **API ClientSecret**
    * **Public Playlist Id:** public playlist that you'd like to download
    * **SpotifyUserId:** owner of the above playlist    
 * *Optional: music folder* (defaults to ./music/)
