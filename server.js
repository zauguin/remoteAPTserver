var fs=require("fs");
var Lazy=require("lazy");
var path=require("path");
var async = require('async');

function parse(file, callback, end, internal){
  file = path.normalize(file);
  var first = !internal;
  if(first) {
    var internal={count:0};
  } else {
    internal.count++;
  }
  return Lazy(fs.createReadStream(file)).lines.map(String).forEach(function(x) {
    if(x[0]=='#')
      return;
    pieces=x.split(' ');
    if(pieces[0]!=":include")
      callback(x);
    else
      pieces.slice(1).forEach(function(y) {
        y = path.resolve(path.dirname(file), y);
        parse(y, callback, end, internal);
      });
  }).on("pipe", function() {
    if(!internal.count--) {
      end()
    }
  });
}

function getFileFromIp(ip, callback) {
  require("./mapping.js")(ip, function(paths) {
    callback(paths.map(function(path) {
      return (process.argv[2]?process.argv[2]:".")+"/"+path;
    }));
  });
}

var http = require('http');

function isFile(filename, callback) {
  fs.stat(filename, function(err, stats) {
    callback(!err && stats.isFile());
  });
}
  
http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  getFileFromIp(request.connection.remoteAddress, function(paths) {
    async.filter(paths, isFile, function(paths) {
      if(!paths.length)
        paths = [(process.argv[2]?process.argv[2]:".")+"/"+'default'];
      var i = 0;
      paths.forEach(function(path) {
        i++;
        parse(path, function(x){response.write(x+"\n");}, function(){if(!(--i)) response.end()});
      });
    });
  });
}).listen(process.argv[3]?process.argv[3]:8080, "::");
