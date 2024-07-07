#!/bin/sh

sudo apt-get update

# https://github.com/electron/electron/issues/32503#issuecomment-1014753684
sudo apt-get install -y --no-install-recommends \
    git \
    libasound2 \
    libatk-bridge2.0-0 \
    libcanberra-gtk3-module \
    libdrm-dev \
    libgbm-dev \
    libgconf2-dev \
    libgtk-3-0 \
    libgtk-3.0 \
    libgtk2.0-0 \
    libnotify-dev \
    libnss3 \
    libx11-xcb-dev \
    libxss1 \
    libxtst-dev \
    libxtst6 \
    xauth \
    xserver-xorg \
    xvfb

sudo dpkg-reconfigure xserver-xorg

npm install

export DISPLAY="host.docker.internal:0"
sudo dbus-daemon --system >/dev/null
sudo service dbus start
ELECTRON_ENABLE_LOGGING=true \
    npm run start
