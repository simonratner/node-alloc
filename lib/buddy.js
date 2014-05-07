var assert = require('assert');
var debug = require('debug')('alloc:buddy');
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

  // Maintain fragmentation statistics.
  this.bytesTotal = this.buffer.length;
  this.bytesAllocated = 0;
  this.bytesWasted = 0;

  // Maintain a free list for each block size.
  this.free = [];
  for (var i = 0; i < log2(this.buffer.length) - this.minRank; i++) {
    this.free.push([]);
  }
  this.free.push([0]);
};

BuddyAllocator.prototype.rank = function(x) {
  return Math.max(0, ((log2(x - 1) + 1) | 0) - this.minRank);
};

BuddyAllocator.prototype.alloc = function(size) {
  // Find the first unallocated block of sufficient size.
  for (var i = this.rank(size); i < this.free.length; i++) {
    if (this.free[i].length) {
      var offset = this.free[i].pop();
      var half;
      // Split the block recursively until it is just big enough.
      for (half = 1 << (i + this.minRank - 1);
           half >= size && i > 0;
           half >>= 1) {
        var buddy = offset + half;
        this.free[--i].push(buddy);
        debug('split block @%d, buddy @%d', offset, buddy);
      }
      var wasted = (half << 1) - size;
      this.bytesAllocated += size;
      this.bytesWasted += wasted;
      debug('alloc block @%d, wasting %d bytes', offset, wasted);
      return this.buffer.slice(offset, offset + size);
    }
  }
  return null;
};

BuddyAllocator.prototype.free = function(block) {
  assert(false, 'Not implemented');
};

module.exports = BuddyAllocator;
