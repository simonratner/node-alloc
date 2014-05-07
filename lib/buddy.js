var assert = require('assert');
var util = require('util');

function log2(x) {
  return Math.log(x) / Math.LN2;
}

function power2(x) {
  return 1 << (log2(x - 1) + 1);
}

var BuddyAllocator = function(buffer, options) {
  if (typeof buffer == 'number') {
    buffer = new Buffer(power2(buffer));
  }
  assert(buffer.length > 1 && !(buffer.length & (buffer.length - 1)),
         'Buffer length must be a positive power of 2');

  options = util._extend({minBuddySize: 1}, options);

  this.buffer = buffer;
  this.minRank = log2(options.minSize) | 0;
  this.minSize = 1 << this.minRank;
  this.free = new Array(log2(this.buffer.length) - this.minRank + 1);
};

BuddyAllocator.prototype.rank = function(x) {
  return Math.max(0, ((log2(x - 1) + 1) | 0) - this.minRank);
};

BuddyAllocator.prototype.alloc = function(size) {
  assert(false, 'Not implemented');
};

BuddyAllocator.prototype.free = function(block) {
  assert(false, 'Not implemented');
};

module.exports = BuddyAllocator;
