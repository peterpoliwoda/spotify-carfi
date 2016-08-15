#!/bin/bash

# Remove all .mp3 files in the main folder on the CARFI USB stick
cd /Volumes/CARFI
rm -f *.mp3

# Run Carfi Spotify playlist grabber script
cd /Users/peterpoliwoda/Development/git/spotify-carfi
node carfi-spotify.js

# Copy all downloaded music to the CARFI USB Stick
cp music/*.mp3 /Volumes/CARFI/
