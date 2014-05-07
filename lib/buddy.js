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
  this.freelist = [];
  for (var i = 0; i < log2(this.buffer.length) - this.minRank; i++) {
    this.freelist.push([]);
  }
  this.freelist.push([0]);
};

BuddyAllocator.prototype.rank = function(x) {
  return Math.max(0, ((log2(x - 1) + 1) | 0) - this.minRank);
};

BuddyAllocator.prototype.alloc = function(size) {
  // Find the first unallocated block of sufficient size.
  for (var i = this.rank(size); i < this.freelist.length; i++) {
    if (this.freelist[i].length) {
      var offset = this.freelist[i].pop();
      var half;
      // Split the block recursively until it is just big enough.
      for (half = 1 << (i + this.minRank - 1);
           half >= size && i > 0;
           half >>= 1) {
        var buddy = offset + half;
        this.freelist[--i].push(buddy);
        debug('split @%d, buddy @%d', offset, buddy);
      }
      var wasted = (half << 1) - size;
      this.bytesAllocated += size;
      this.bytesWasted += wasted;
      debug('alloc @%d, used %d bytes, wasted %d bytes', offset, size, wasted);
      return this.buffer.slice(offset, offset + size);
    }
  }
  return null;
};

BuddyAllocator.prototype.free = function(block) {
  // Find the offset within parent buffer.
  var offset = block.offset - this.buffer.offset;

  var rank = this.rank(block.length);
  var reclaimed = 1 << (rank + this.minRank);
  this.bytesAllocated -= block.length;
  this.bytesWasted -= reclaimed - block.length;
  debug('free @%d, reclaiming %d bytes', offset, reclaimed);

  // Merge recursively until we exhaust all unallocated buddies.
  for (var i = rank; i < this.freelist.length - 1; i++) {
    var buddy = offset ^ (1 << (i + this.minRank));
    var merged = false;
    for (var j = 0; j < this.freelist[i].length; j++) {
      if (this.freelist[i][j] == buddy) {
        debug('merge @%d, buddy @%d', offset, buddy);
        merged = this.freelist[i].splice(j, 1);
        if (offset > buddy) {
          offset = buddy;
        }
        break;
      }
    }
    if (!merged) {
      break;
    }
  }
  this.freelist[i].push(offset);
};

module.exports = BuddyAllocator;
