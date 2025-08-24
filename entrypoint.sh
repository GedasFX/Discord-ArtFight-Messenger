#!/bin/sh

# Set up a virtual display
[ -e /tmp/.X99-lock ] && rm /tmp/.X99-lock
Xvfb :99 -screen 0 1024x768x24 &

# Start the app
node ./index.js