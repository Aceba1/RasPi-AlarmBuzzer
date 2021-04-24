import sys
from time import sleep
import pifacedigitalio

if __name__ == "__main__":
  pifacedigital = pifacedigitalio.PiFaceDigital()
  pifacedigital.relays[0].turn_on()
  sleep(float(sys.argv[1]) * 0.001)
  pifacedigital.relays[0].turn_off()