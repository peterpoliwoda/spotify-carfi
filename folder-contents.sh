#!/bin/bash
# ls music | tr '\n' ';' | curl -H "Content-Type: text/html" -X POST -d @- http://localhost:3000/carfi

# /etc/init.d/carfi
cd /mnt/sdcard
ls | tr '\n' ';' | curl -H "Content-Type: text/html" -X POST -d @- http://peterpoliwoda.me:3000/carfi/download > /tmp/carfi.download
ls | tr '\n' ';' | curl -H "Content-Type: text/html" -X POST -d @- http://peterpoliwoda.me:3000/carfi/delete > /tmp/carfi.delete
cd /tmp

logger "Removing annoying songs"
while read DEL_SONG_NAME; do
  if [ -n "$DEL_SONG_NAME" ]; then
    logger "$DEL_SONG_NAME"
    rm -rf /mnt/sdcard/$DEL_SONG_NAME
  fi
done <carfi.delete

logger "Downloading songs"
while read NEW_SONG_NAME; do
  if [ -n "$NEW_SONG_NAME" ]; then
    logger "$NEW_SONG_NAME"
    wget "http://peterpoliwoda.me:3000/music/$NEW_SONG_NAME" -O /mnt/sdcard/$NEW_SONG_NAME
  fi
done <carfi.download

logger "Playlist refreshed. Remounting CarFi"
