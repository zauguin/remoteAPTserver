var dns = require("dns");

module.exports = function(ip, callback) {
  var match;
  if(match = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/))
    ip = match[1];
  dns.reverse(ip, function(err, domains) {
    callback(domains?domains[0]:'');
  });
}
