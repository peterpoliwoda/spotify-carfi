#!/bin/bash

# -q quiet
# -c nb of pings to perform
COUNTER=0
ONLINE=0

while [ $COUNTER -lt 18 ]; do
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
  curl peterpoliwoda.me
fi
