#!/bin/bash

# -q quiet
# -c nb of pings to perform
COUNTER=0
ONLINE=0

while [ $COUNTER -lt 3 ]; do
  ping -q -c5 google.com > /dev/null 2>&1
  if [ $? -eq 0 ]; then
  	echo "device online"
    ONLINE=1
    break
  else
    let COUNTER=COUNTER+1
    echo "Not online just yet. Waiting..."
    sleep 5
  fi
done

if [ $ONLINE = 1 ]; then
  curl peterpoliwoda.me
fi
