module.exports = function sleep(millisec) {
  return new Promise(p => setTimeout(p, millisec));
};