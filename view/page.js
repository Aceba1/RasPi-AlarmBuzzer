// -- UTIL --

function asyncRequest(endpoint, method = "GET", body = "") {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.onload = function () {
      if (this.status < 400) resolve(this);
      else
        reject({
          status: this.status,
          statusText: this.statusText
        });
    };
    request.onerror = function () {
      reject({
        status: this.status,
        statusText: this.statusText
      });
    };
    request.open(method, document.baseURI + endpoint);
    request.responseType = "text";
    request.setRequestHeader("Content-Type", "application/json");
    request.send(body ? JSON.stringify(body) : undefined);
  });
}

function leadTime(hm) {
  hm = (hm % 1200).toString();
  switch (hm.length) {
    case 1:
      return `12:0${hm}`;
    case 2:
      return `12:${hm}`;
    case 3:
      return `0${hm.slice(0, 1)}:${hm.slice(1, 3)}`;
    case 4:
      return `${hm.slice(0, 2)}:${hm.slice(2, 4)}`;
  }
}

function timeToHM(time, ampm) {
  return ((parseInt(time.replace(/:/, ""), 10) % 1200) + (ampm ? 1200 : 0)) % 2400;
}

const dayMap = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

function topBarTime() {
  const date = new Date();
  document.getElementById('sub').innerHTML = date.getHours() >= 12 ? 'PM' : 'AM';
  document.getElementById('top-bar-time').innerHTML = 
    `${dayMap[date.getDay()]} ${leadTime(date.getHours() * 100 + date.getMinutes())}`;
}

function daysActive(days, index) {
  let str = "";
  for (let i = 0; i < 7; i++)
    str += `<div title=${dayMap[i]} class="day-box${
      days.includes(i) ? " active" : ""
    }" onclick="dayClicked(${index},${i})"></div>`;
  return str;
}

function scheduleItem(item, index) { 
  return `
    <div class="left">
      <input class="time" title="Set time"
        oninput="cleanTime(this, ${index})"
        onchange="cleanTime(this, ${index}, true)"
        value="${leadTime(item.time)}">
      <label title="Flip time" onclick="flipTime(${index})" class="sign no-select highlight">
        ${item.time >= 1200 ? "PM" : "AM"}
      </label>
    </div>
    <div class="center vert">
      <input class="desc" placeholder="Scheduled Alarm"
        value="${item.desc ?? ""}"
        oninput="updateDesc(this, ${index})">
      <div class="days highlight">
        ${daysActive(item.days, index)}
      </div>
    </div>
    <div class="right">
      <div title="Remove alarm" class="x-button" onclick="removeItem(${index})"></div>
    </div>`
}

function scheduleListFrag(list) {
  const frag = document.createDocumentFragment();
  for (const i in list) {
    const item = document.createElement("div");
    item.className = "schedule-item";
    item.innerHTML = scheduleItem(list[i], i);
    frag.appendChild(item);
  }
  return frag;
}

// -- CONTENT --

let list = [/*##SCHEDULE##*/];

function addToList() {
  list.push({
    days: [1, 2, 3, 4, 5],
    time: 1200,
    desc: ""
  });
}

function updateList() {
  const domList = document.getElementById("list");
  if (list.length === 0) {
    domList.innerHTML = '<p class="info">No alarms set</p>';
  } else {
    domList.innerHTML = "";
    domList.appendChild(scheduleListFrag(list));
  }
}

function addClicked() {
  addToList();
  updateList();
  save();
}

function testAlarm() {
  asyncRequest("trigger", "PUT");
}

function save(callback = true) {
  asyncRequest("setalarms", "PUT", { data: list, callback });
}

function dayClicked(itemIndex, dayIndex) {
  const days = list[itemIndex].days;
  const index = days.indexOf(dayIndex);
  if (index !== -1) days.splice(index, 1);
  else days.push(dayIndex);

  updateList();
  save();
}

function removeItem(itemIndex) {
  list.splice(itemIndex, 1);
  updateList();
  save();
}

let lastValidLength = /*##DEFAULTLENGTH##*/ 3;

function updateLength(e, validate) {
  const input = parseFloat(e.value);
  if (input !== null && !isNaN(input) && input >= 1) {
    if (validate) lastValidLength = input;
    asyncRequest("setlength", "PUT", { length: input });
  } else if (validate) {
    e.value = lastValidLength;
  }
}

function updateDesc(e, itemIndex) {
  list[itemIndex].desc = e.value;
  save(false);
}

function flipTime(itemIndex) {
  list[itemIndex].time = (list[itemIndex].time + 1200) % 2400;
  updateList();
  save();
}

function cleanTime(e, itemIndex, validate) {
  let raw = e.value.replace(/[^0-9\:]/, "");
  e.value = raw;
  if (validate) {
    const item = list[itemIndex];
    let time = timeToHM(raw, item.time >= 1200);
    if (time >= 0) {
      e.value = leadTime(time);
      item.time = time;
      save();
    } else {
      e.value = leadTime(item.time);
    }
  }
}

function serverTime(valid) {
  if (valid) {
    console.info("Server time is set");
    document.getElementById("error").style.display = "none";
  } else {
    console.warn("Server time is unset!");
    document.getElementById("error").style.display = "inline-block";
  }
}

async function getServerTime(callback) {
  return asyncRequest('gettime', 'GET').then(v =>  callback(v.response));
}

function setServerTime() {
  return asyncRequest('settime', 'PUT', { time: new Date().toISOString() });
}

// Handle first page draw
topBarTime();
updateList();
setTimeout(() => {topBarTime(); setInterval(topBarTime, 60000)}, 60500 - (Date.now() % 60000));

getServerTime(v => {
  const time = JSON.parse(v).time;
  if (Math.abs(time - Date.now()) > 5000) {
    serverTime(false)
    setServerTime().then(() => setTimeout(() => serverTime(true), 1000));
  }
})