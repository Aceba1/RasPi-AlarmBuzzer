const fs = require('fs');

/**
 * @typedef {{
 *  days: number[],
 *  time: number,
 *  length: number,
 * }} Alarm
 */

const path = process.env.JSONPATH || './schedule.json';

/**
 * @type {{
 * alarms: Alarm[],
 * buzzerLength: number
 * }
 */
let data = {
  alarms: [],
  buzzerLength: 3000,
};

let updateCallback;

const getAlarms = () => data.alarms;

const getBuzzerLength = () => data.buzzerLength;

const setData = newData => {
  const keys = Object.keys(data);
  for (const i in keys) {
    const key = keys[i];
    if (newData[key] !== undefined)
      data[key] = newData[key] || data[key];
  }
  sortByTime();
};

const sortByTime = () => data.alarms.sort((a, b) => a.time - b.time);

const loadFile = () => {
  console.info(`Loading schedule ${path}`);
  if (fs.existsSync(path)) {
    try {
    setData(JSON.parse(fs.readFileSync(path).toString()));
    } catch(e) {
      console.info('File is corrupt!');
    }

    console.info('Schedule loaded');
  } else {
    console.info('File not found!');
  }
};

const triggerScheduleCallback = () => {
  if (updateCallback) updateCallback();
};

const onScheduleChangeEvent = callback => updateCallback = callback;

const saveFile = () => {
  console.info('Saving schedule');
  fs.writeFileSync(path, JSON.stringify(data));
  console.info('Schedule saved');
};

loadFile();

module.exports = {
  getAlarms,
  getBuzzerLength,
  setData,
  loadFile,
  saveFile,
  triggerScheduleCallback,
  onScheduleChangeEvent,
};