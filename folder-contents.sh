#!/bin/bash
URL=http://localhost:3000/carfi;
ls | tr '\n' ';' | curl -H "Content-Typei text/html" -X POST -d @- $URL
