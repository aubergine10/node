'use strict';
var common = require('../common');
var assert = require('assert');

if (!common.hasCrypto) {
  common.skip('missing crypto');
  return;
}
var tls = require('tls');

var fs = require('fs');
var path = require('path');

var key = fs.readFileSync(path.join(common.fixturesDir, 'pass-key.pem'));
var cert = fs.readFileSync(path.join(common.fixturesDir, 'pass-cert.pem'));

var server = tls.Server({
  key: key,
  passphrase: 'passphrase',
  cert: cert,
  ca: [cert],
  requestCert: true,
  rejectUnauthorized: true
}, function(s) {
  s.end();
});

var connectCount = 0;
server.listen(0, function() {
  var c = tls.connect({
    port: this.address().port,
    key: key,
    passphrase: 'passphrase',
    cert: cert,
    rejectUnauthorized: false
  }, function() {
    ++connectCount;
  });
  c.on('end', function() {
    server.close();
  });
});

assert.throws(function() {
  tls.connect({
    port: server.address().port,
    key: key,
    passphrase: 'invalid',
    cert: cert,
    rejectUnauthorized: false
  });
});

process.on('exit', function() {
  assert.equal(connectCount, 1);
});
