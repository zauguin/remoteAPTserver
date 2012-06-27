var dns = require("dns");

module.exports = function(ip, callback) {
  dns.reverse(ip, function(err, domains) {
    callback(domains?domains[0]:'default');
  });
}
