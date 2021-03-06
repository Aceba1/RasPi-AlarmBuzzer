# RasPi-AlarmBuzzer

A raspberry pi scheduled buzzer for use with a relay

The configuration page is hosted on [raspberrypi.local:5000](raspberrypi.local:5000) through ethernet (or wireless if not disabled)

## Setup

### Requirements
- Raspberry Pi
- MicroSD Card
- MicroUSB power source
- Desktop (or Laptop)
- Ethernet Cable

### Initial
- Flash the MicroSD card with [Raspberry Pi Imager](https://www.raspberrypi.org/software/) (or preferred method)
- Make a new file in the Boot partition named `SSH` (with no file ending)
- Insert MicroSD to Raspberry Pi
- Connect power to Raspberry Pi

### SSH
- Connect Ethernet cable to Pi and Desktop
- Connect to Pi with **`ssh pi@raspberrypi.local`** (Terminal, Powershell, PuTTY)
  - If prompted, trust domain
  - Default password is `raspberry`

#### Connect to Internet
- Within SSH, run **`sudo raspi-config`**
- **System Options**, **Network Options**, **Wireless LAN**
  - **SSID** is the router's name, as it would appear on other devices
  - Provide **Password** if applicable
- **Localization Options**, **Timezone**
  - Select your geographic area
  - Select your city / region

**Note:** The configuration page may be public to any client on the same network! 

To forget a network after **Install** is complete, edit `/etc/wpa_supplicant/wpa_supplicant.conf` and remove the `network={...}` entries

### Install
Through SSH, clone or transfer the repository's files into the home directory.

These commands prepare the environment to run the project:
<!-- TODO: Add direct support for GPIO -->
- **`sudo apt update`**
- **`sudo apt upgrade -y`**
- **`sudo apt install -y python3-pip nodejs npm`**
  - `python3-pip`: This is to get the python driver for the Element14 PiFace shield
  - `nodejs`: Runs the backend for scheduling and configuring the buzzer
  - `npm`: Necessary to install the backend's dependencies
- **`sudo pip3 install pifacecommon pifacedigitalio `**
  - [`pifacecommon`](https://github.com/piface/pifacecommon): Necessary for `pifacedigitalio`
  - [`pifacedigitalio`](https://github.com/piface/pifacedigitalio): Necessary for controlling the shield relays
- `echo "`**`dtparam=spi=on`**`" | sudo tee -a /boot/config.txt`
  - Enable the SPI Module, used to communicate with the PiFace board
  - (It is possible to add this line manually from an SD card reader. Handle with care!)

### Start on Boot
- Use [`crontab -e`](https://www.raspberrypi.org/documentation/linux/usage/cron.md)
  - More specifically, add an entry using `@reboot` for `node /home/pi/.../index.js &` or a custom script