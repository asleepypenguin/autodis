const spdutils = {};

spdutils.buf2json = function(buf) {
  return JSON.parse(buf.toString('utf16le'));
}

spdutils.buf2str = function(buf) {
  return buf.toString('utf16le');
}

spdutils.str2ab = function(str) {
  var buf = new Buffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
spdutils.json2buf = function(jsonObj) {
  var str = JSON.stringify(jsonObj);
  var buf = Buffer.from(str, 'utf16le');
  return buf;
}

module.exports = spdutils;
