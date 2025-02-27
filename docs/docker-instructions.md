# Running windows95 in Docker

## Display using a volume mount of the host X11 Unix Socket (Linux Only)

### Requirements // X11 Unix Socket

- Linux OS with a running X-Server Display
- [Docker](http://docker.io)

  ```bash
  docker run -it \
    -v "/tmp/.X11-unix":"/tmp/.X11-unix" \
    -e DISPLAY="unix$DISPLAY" \
    --device "/dev/snd" \
    --name "windows95" \
    toolboc/windows95
  ```

> [!NOTE]
> You may need to run `xhost +` on your system to allow connections to the X server running on the host.

## Display using Xming X11 Server over tcp Socket (Windows and beyond)

### Requirements // Xming X11 Server

- [Xming](https://sourceforge.net/projects/xming/)
- [Docker](http://docker.io)

### Steps

1. Start the Xming X11 Server
2. Run the command below:

   ```bash
   docker run -e DISPLAY=host.docker.internal:0 --name windows95 toolboc/windows95
   ```

## Display using the host XQuartz Server (MacOS Only)

### Requirements // XQuartz Server

- [XQuartz](https://www.xquartz.org/)
- [Docker](http://docker.io)

1. Start XQuartz, go to `Preferences` -> `Security`, and check the box `Allow connections from network clients`
2. Restart XQuartz
3. In the terminal, run:

   ```bash
   xhost +
   ```

4. Run:

   ```bash
   docker run -it -e DISPLAY=host.docker.internal:0 toolboc/windows95
   ```
