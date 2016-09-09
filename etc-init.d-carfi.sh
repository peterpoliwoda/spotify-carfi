#!/bin/sh /etc/rc.common
# Car-Fi Spotify: playlist downloader for your car
# Copyright (C) 2016 PeterPoliwoda.me

START=51
STOP=91

NOW=$(date)

start() {
	COUNTER=0
	ONLINE=0
	rm -f /tmp/carfi.log
	logger "### Starting script ###"
	logger "$NOW"
	echo "0" > /sys/class/gpio/gpio21/value
	sleep 3
	logger "does /dev contain sda1?"
	logger $(ls -x /dev/ | grep sda1)
	mount /dev/sda1 /mnt/sdcard
	cd /mnt/sdcard

	while [ $COUNTER -lt 3 ]; do
	   ping -q -c5 google.com > /dev/null 2>&1
	   if [ $? -eq 0 ]; then
 	     # device online
	     ONLINE=1
	     echo "took him "$COUNTER > /mnt/sdcard/_howlong.txt
	     touch /tmp/COUNTER_$COUNTER.txt
   	     break
 	   else
   	    let COUNTER=COUNTER+1
   	    # Not online just yet. Waiting...
   	    sleep 5
	  fi
	done
	if [ $ONLINE = 1 ]; then
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
	      wget "http://peterpoliwoda.me:3000/music/$NEW_SONG_NAME" -O "/mnt/sdcard/$NEW_SONG_NAME"
	    fi
	  done <carfi.download

	  logger "Playlist refreshed."
	fi

	logger "Remounting CarFi Card"
	echo "1" > /sys/class/gpio/gpio21/value
}

logger() {
  for var in "$@"
  do
    echo "$var" >> /tmp/carfi.log
  done
}
