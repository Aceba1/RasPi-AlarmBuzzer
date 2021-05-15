const execSync = require('child_process').execSync;

function leadZero(n) {
  return n > 9 ? n : '0' + n;
}

module.exports = function setTime(value) {
  const date = new Date(value);
  console.log(`old Date is ${new Date()}`);
  execSync('sudo timedatectl set-ntp false');
  execSync(`sudo timedatectl set-time ${date.getFullYear()}-${leadZero(date.getMonth() + 1)}-${leadZero(date.getDate())}`);
  execSync(`sudo timedatectl set-time ${leadZero(date.getHours())}:${leadZero(date.getMinutes())}:${leadZero(date.getSeconds())}`);
  console.log(`new Date is ${new Date()}`);
};