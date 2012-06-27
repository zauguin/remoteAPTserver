var fs=require("fs");
var Lazy=require("lazy");

function parse(file, callback, end, internal){
  var first = !internal;
  if(first) {
    var internal={count:0};
  } else {
    internal.count++;
  }
  return Lazy(fs.createReadStream(file)).lines.map(String).forEach(function(x) {
    pieces=x.split(' ');
    if(pieces[0]!=":include")
      callback(x);
    else
      pieces.slice(1).forEach(function(y) {
        parse(y, callback, end, internal);
      });
  }).on("pipe", function() {
    if(!internal.count--) {
      end()
    }
  });
}

function getFileFromIp(ip, callback) {
  require("./mapping.js")(ip, function(path) {
    callback((process.argv[2]?process.argv[2]:".")+"/"+path);
  });
}

var http = require('http');

http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    getFileFromIp(request.connection.remoteAddress, function(path) {
      parse(path, function(x){response.write(x+"\n");}, function(){response.end()});
    });
}).listen(process.argv[3]?process.argv[3]:8080);
