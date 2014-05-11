var fs = require('fs');
var from = require('from');
var byline = require('byline');
var stream = require('stream');

var Benchmark = function(allocator, data) {
  if (Array.isArray(data)) {
    data = from(data);
  } else if (typeof data == 'string') {
    var lines = byline.createStream(fs.createReadStream(data));
    var numbers = new stream.Transform({objectMode: true});
    numbers._transform = function(chunk, encoding, done) {
      this.push(parseInt(chunk.toString()));
      done();
    };
    data = lines.pipe(numbers);
  }
  this.data = data;
  this.allocator = allocator;
};

Benchmark.prototype.run = function() {
  var alloc = this.allocator;
  this.data.on('data', function(n) {
    alloc.alloc(n);
  });
  this.data.on('end', function() {
    console.dir(alloc);
  });
  this.data.on('error', function(err) {
    console.error(err);
  });
};

module.exports = Benchmark;
