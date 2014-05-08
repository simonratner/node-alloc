var BuddyAllocator = require('..').BuddyAllocator;

describe('BuddyAllocator', function() {

  it('cannot be constructed with invalid size', function() {
    expect(function() { new BuddyAllocator() }).toThrow();
    expect(function() { new BuddyAllocator(1) }).toThrow();
  });

  it('cannot be constructed with buffer of invalid length', function() {
    expect(function() { new BuddyAllocator(new Buffer(0)) }).toThrow();
    expect(function() { new BuddyAllocator(new Buffer(10)) }).toThrow();
  });

  it('can be constructed with existing buffer', function() {
    var buffer = new Buffer(16);
    var buddy = new BuddyAllocator(buffer);
    expect(buddy.buffer).toBe(buffer);
  });

  it('can be constructed with size', function() {
    var buddy = new BuddyAllocator(16);
    expect(buddy.buffer.length).toBe(16);
  });

  it('can be constructed with size rounded up to a power of two', function() {
    var buddy = new BuddyAllocator(10);
    expect(buddy.buffer.length).toBe(16);
  });

  describe('options', function() {
    it('min size defaults to 1', function() {
      var buddy = new BuddyAllocator(16);
      expect(buddy.minSize).toBe(1);
    });

    it('min size can be set to a power of two', function() {
      var buddy = new BuddyAllocator(16, {minSize: 4});
      expect(buddy.minSize).toBe(4);
    });

    it('min size is rounded down to a power of two', function() {
      var buddy = new BuddyAllocator(16, {minSize: 6});
      expect(buddy.minSize).toBe(4);
    });
  });

  describe('rank', function() {

    it('is never negative', function() {
      var buddy = new BuddyAllocator(16);
      expect(buddy.rank(0)).toBe(0);
      expect(buddy.rank(-1)).toBe(0);
    });

    it('is never negative (with min size)', function() {
      var buddy = new BuddyAllocator(16, {minSize: 4});
      expect(buddy.rank(0)).toBe(0);
      expect(buddy.rank(2)).toBe(0);
    });

    it('is correct for n = 1', function() {
      var buddy = new BuddyAllocator(16);
      expect(buddy.rank(1)).toBe(0);
    });

    it('is correct for n > 1 (power of two)', function() {
      var buddy = new BuddyAllocator(16);
      expect(buddy.rank(4)).toBe(2);
    });

    it('is correct for n > 1 (power of two, with min size)', function() {
      var buddy = new BuddyAllocator(16, {minSize: 4});
      expect(buddy.rank(4)).toBe(0);
    });

    it('is correct for n > 1 (not power of two)', function() {
      var buddy = new BuddyAllocator(16);
      expect(buddy.rank(5)).toBe(3);
    });

    it('is correct for n > 1 (not power of two, with min size)', function() {
      var buddy = new BuddyAllocator(16, {minSize: 4});
      expect(buddy.rank(5)).toBe(1);
    });
  });

  describe('alloc', function() {
    var buddy;

    beforeEach(function() {
      buddy = new BuddyAllocator(16, {minSize: 4});
    });

    it('can allocate a block smaller than min size', function() {
      var b = buddy.alloc(2);
      expect(b.length).toBe(2);
      expect(b.parent).toBe(buddy.buffer.parent);
      expect(buddy.freelist).toEqual([[4], [8], []]);
    });

    it('can allocate a block larger than min size', function() {
      var b = buddy.alloc(6);
      expect(b.length).toBe(6);
      expect(b.parent).toBe(buddy.buffer.parent);
      expect(buddy.freelist).toEqual([[], [8], []]);
    });

    it('can allocate entire buffer', function() {
      var b = [
        buddy.alloc(4),
        buddy.alloc(4),
        buddy.alloc(4),
        buddy.alloc(4),
      ];
      b.forEach(function(bi, i) {
        expect(bi.length).toBe(4);
        expect(bi.parent).toBe(buddy.buffer.parent);
        b.forEach(function(bj, j) {
          if (i == j) {
            return;
          }
          expect(Math.abs(bi.offset - bj.offset)).toBeGreaterThan(bi.length - 1);
        });
      });
      var c = buddy.alloc(4);
      expect(c).toBeFalsey();
      expect(buddy.freelist).toEqual([[], [], []]);
    });
  });

  describe('free', function() {
    var buddy;

    beforeEach(function() {
      buddy = new BuddyAllocator(16, {minSize: 4});
    });

    it('can free a block smaller than min size', function() {
      var b = buddy.alloc(2);
      buddy.free(b);
      expect(buddy.freelist).toEqual([[], [], [0]]);
    });

    it('can free a block larger than min size', function() {
      var b = buddy.alloc(6);
      buddy.free(b);
      expect(buddy.freelist).toEqual([[], [], [0]]);
    });

    it('can free entire buffer', function() {
      var b = [
        buddy.alloc(4),
        buddy.alloc(4),
        buddy.alloc(4),
        buddy.alloc(4),
      ];
      b.forEach(function(bi, i) {
        buddy.free(bi);
      });
      expect(buddy.freelist).toEqual([[], [], [0]]);
    });

    it('can free entire buffer out of order', function() {
      var b = [
        buddy.alloc(4),
        buddy.alloc(4),
        buddy.alloc(4),
        buddy.alloc(4),
      ];
      buddy.free(b[0]);
      expect(buddy.freelist).toEqual([[0], [], []]);
      buddy.free(b[2]);
      expect(buddy.freelist).toEqual([[0, 8], [], []]);
      buddy.free(b[1]);
      expect(buddy.freelist).toEqual([[8], [0], []]);
      buddy.free(b[3]);
      expect(buddy.freelist).toEqual([[], [], [0]]);
    });
  });

  describe('statistics', function() {
    var buddy;

    beforeEach(function() {
      buddy = new BuddyAllocator(16, {minSize: 4});
    });

    it('keeps track of total space', function() {
      expect(buddy.bytesTotal).toBe(16);
    });

    it('keeps track of allocated space', function() {
      var b = buddy.alloc(4);
      expect(buddy.bytesAllocated).toBe(4);
    });

    it('keeps track of wasted space', function() {
      var b = buddy.alloc(2);
      expect(buddy.bytesAllocated).toBe(2);
      expect(buddy.bytesWasted).toBe(2);
    });

    it('reclaims space after free', function() {
      var b = buddy.alloc(2);
      buddy.free(b);
      expect(buddy.bytesAllocated).toBe(0);
      expect(buddy.bytesWasted).toBe(0);
    });
  });
});
