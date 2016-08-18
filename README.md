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

## Temporary AppleScript USB solution
Drop the **carfi.sh** into your USB memory stick main folder for the AppleScript to pick up. It will pop up an alert to confirm you plugged in the correct device and then another alert after it's finished copying your playlist songs to the USB drive.

You will probably need to modify your the **carfi.sh** with the cloned git repo location.

You will also need to put the **runOnCarfi.scpt** in **~/Library/Workflows/Applications/Folder Actions/** to make it run the AppleScript on USB.
