const express = require('express');
const fs = require('fs');

const router = express.Router();

const setTime = require('../util/setTime');
const scheduler = require('./../util/scheduler');

const page = fs.readFileSync('./view/page.html').toString()
  .replace(/<!--\s*?##STYLE##\s*?-->/, `<style>${fs.readFileSync('./view/page.css').toString()}</style>`)
  .replace(/<!--\s*?##SCRIPT##\s*?-->/, `<script>${fs.readFileSync('./view/page.js').toString()}</script>`);

const preparePage = () => 
  page.replace(/\[\s*?\/\*##SCHEDULE##\*\/\s*?\]/, JSON.stringify(scheduler.getAlarms()) || [])
    .replace(/(\/\*|)##DEFAULTLENGTH##(\*\/\s*?[0-9]*|)/, scheduler.getBuzzerLength() / 1000.0);

/**
 * @param {Request} req
 * @param {Response} res
 */

router.put('/setlength', (req, res) => {
  console.log('Writing length');
  scheduler.setData({ buzzerLength: req.body.length * 1000 });
  scheduler.saveFile();
  res.send();
});

router.put('/setalarms', (req, res) => {
  console.log('Writing alarms');
  scheduler.setData({ alarms: req.body.data });
  scheduler.saveFile();
  if (req.body.callback)
    scheduler.triggerScheduleCallback();
  res.send();
});

router.put('/trigger', (req, res) => {
  require('../util/buzzer').buzz(scheduler.getBuzzerLength());
  res.send();
});

router.put('/settime', (req, res) => {
  setTime(req.body.time);
  scheduler.triggerScheduleCallback();
  res.send();
});

router.get('/gettime', (req, res) => {
  res.send({ time: Date.now() });
});

router.get('/', (req, res) => {
  res.send(preparePage());
});

module.exports = router;