var byline = require('byline');
var fs = require('fs');
var from = require('from');
var measured = require('measured');
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
  this.stats = measured.createCollection();
};

Benchmark.prototype.run = function(cb) {
  var alloc = this.allocator;
  var stats = this.stats;

  this.data.on('data', function(n) {
    alloc.alloc(n);
    stats.timer('allocations').update(n);
  });
  this.data.on('end', function() {
    stats.gauge('bytes', function() {
      var bytes = {};
      [ 'bytesRequested',
        'bytesAllocated',
        'bytesWasted',
        'bytesTotal'
      ].forEach(function(prop) {
        bytes[prop.replace('bytes', '').toLowerCase()] = alloc[prop];
      });
      return bytes;
    });
    // Prevent the timer from blocking the event loop.
    stats.timer('allocations')._meter.unref();
    // Ensure keys are valid identifiers.
    stats.timer('allocations')._meter.toJSON = function() {
      return {
        'count'    : this._count,
        'current'  : this.currentRate(),
        'mean'     : this.meanRate(),
        'm1'       : this._m1Rate.rate(this._rateUnit),
        'm5'       : this._m5Rate.rate(this._rateUnit),
        'm15'      : this._m15Rate.rate(this._rateUnit),
      };
    }
    cb && cb();
  });
  this.data.on('error', function(err) {
    cb && cb(err);
  });
};

module.exports = Benchmark;
