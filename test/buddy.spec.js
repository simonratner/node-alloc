var BuddyAllocator = require('..');

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
});
