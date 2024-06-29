# DESCRIPTION:  Run Windows 95 in a container
# AUTHOR:       Paul DeCarlo <toolboc@gmail.com>
#
#   Made possible through prior art by:
#   copy (v86 - x86 virtualization in JavaScript)
#   felixrieseberg (Windows95 running in electron)
#   Microsoft (Windows 95)
#
#======================================
# Docker Run Command
#======================================
#
#   docker run -it \
#    -v /tmp/.X11-unix:/tmp/.X11-unix \ # mount the X11 socket
#    -e DISPLAY=unix$DISPLAY \ # pass the display
#    --device /dev/snd \ # sound
#    --name windows95 \
#    toolboc/windows95
#
#======================================
# TroubleShooting
#======================================
#
#   If you receive Gtk-WARNING **: cannot open display: unix:0
#   Run:
#       xhost +
#

FROM node:20

LABEL maintainer="Paul DeCarlo <toolboc@gmail.com>"

# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgtk-3-0 \
    libcanberra-gtk3-module \
    libx11-xcb-dev \
    libgconf2-dev \
    libnss3 \
    libasound2 \
    libxtst-dev \
    libxss1 \
    git \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./forge.config.js ./
COPY ./eslint.config.js ./
COPY ./README.md ./
COPY ./LICENSE ./
COPY ./.prettierignore ./
COPY ./tsconfig.json ./
COPY ./taskfile.yaml ./

COPY ./static/ ./static/
COPY ./src/ ./src/
COPY ./tools/ ./tools/
COPY ./bios/ ./bios/
COPY ./assets/ ./assets/

COPY ./images/windows95.img ./images/windows95.img
COPY ./images/default-state.bin ./images/default-state.bin

RUN npm install
RUN npm run build

ENTRYPOINT [ "bash", "--login", "-c" ]
CMD [ "npm start" ]
