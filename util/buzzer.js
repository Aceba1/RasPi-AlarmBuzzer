const pyDriver = process.cwd() +  '/python/gpio_driver.py';
const usePyDriver = process.env.USE_PIFACE !== undefined && process.env.USE_PIFACE.toLowerCase() === 'true';

const spawn = require('child_process').spawn;

const scheduler = require('./scheduler');

let scheduledTimeouts = [];

function hmToMinutes(hm) {
  return Math.floor(hm / 100) * 60 + (hm % 100);
}

function leadTime(hm) {
  return '0'.repeat(4 - `${hm}`.length) + hm;
}

function filterForDay() {
  const day = new Date().getDay();
  return scheduler.getAlarms().filter(item => item.days.includes(day));
}

function setMidnightTimeout() {
  let now = new Date();
  now = -now.getTime() + now.setHours(24, 0, 0, 15);
  setTimeout(() => {
    setNextAlarms(true);
  }, now);
}

function clearBuzzers() {
  scheduledTimeouts.forEach(timeout => {
    clearTimeout(timeout);
  });
  scheduledTimeouts.splice(0, scheduledTimeouts.length);
}

function scheduleBuzzer(length, msecFromNow) {
  scheduledTimeouts.push(setTimeout(buzz, msecFromNow, length));
}

function setNextAlarms(inclusive = false) {
  const offset = inclusive ? 60000 : 0;
  const now = new Date();
  console.log(`Setting alarms at ${now.toLocaleTimeString()}, ${now.toDateString()}`);
  const currentTime = now.getTime() - now.setHours(0, 0, 0, 0);

  clearBuzzers();

  let lastBuzzer = -1;

  filterForDay().forEach(alarm => {
    const time = hmToMinutes(alarm.time) * 60000;
    if (time + offset > currentTime) {
      if (lastBuzzer === alarm.time) {
        console.log(`Duplicate entry for ${leadTime(lastBuzzer)}`);
      } else {
        lastBuzzer = alarm.time;
        if (time <= currentTime) {
          buzz(alarm.length || scheduler.getBuzzerLength());
        } else {
          console.log(`Set for ${leadTime(alarm.time)} (${time - currentTime}ms)`);
          scheduleBuzzer(alarm.length || scheduler.getBuzzerLength(), time - currentTime);
        }
      }
    }
  });
}

/* "npm i onoff"
const gpioPin = Number.parseInt(process.env.GPIO_PIN);
const Gpio = gpioPin !== undefined ? require('onoff').Gpio : undefined;
const sleep = require('./sleep');

async function useGpio(gpio, msec) {
  if (!Gpio.accessible) {
    console.error("Gpio is not accessible!");
    return;
  }
  const pin = new Gpio(gpio, 'out');
  await pin.write(Gpio.HIGH);
  await sleep (msec);
  await pin.write(Gpio.LOW);
}
*/
//! WARN: Must append `dtparam=spi=on` to `/boot/config.txt` for element14 board
// TODO: Add config for using specific GPIO pin instead of element14 board
function buzz(msec = 1000) {
  console.log(`Triggered buzzer at ${new Date()}`);

  if (usePyDriver) {
    spawn('python3', [pyDriver, msec]);
  /*
  } else if (gpioPin !== undefined) {
    useGpio(gpioPin, msec); */
  } else {
    console.error('No method is set');
  }
}

function initialize() {
  setMidnightTimeout();
  filterForDay();
  setNextAlarms();
}

async function begin() {
  scheduler.onScheduleChangeEvent(initialize);
  initialize();
}

module.exports.buzz = buzz;

module.exports.begin = begin;