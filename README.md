node-alloc
==========

[![travis](http://img.shields.io/travis/simonratner/node-alloc.svg)](https://travis-ci.org/simonratner/node-alloc) &nbsp;
[![npm](http://img.shields.io/npm/v/alloc.svg)](https://www.npmjs.org/package/alloc)

[Buddy allocator](https://en.wikipedia.org/wiki/Buddy_memory_allocation)
backed by a [Buffer](http://nodejs.org/api/buffer.html).

This is likely less efficient than allocating new Buffers and letting them be
garbage-collected. You should probably never use this for anything serious,
unless you are confident that this will solve your very particular problem,
or you simply miss the good ol' days of manual memory management.

Install
-------
```
npm install alloc
```

Use
---
Configure a new buddy allocator. Optional `minSize` can be used to limit
the smallest block that the allocator will allocate (defaults to 1); any
requests for fewer than `minSize` bytes will still use up a `minSize` block.
```javascript
var BuddyAllocator = require('alloc').BuddyAllocator;
var buddy = new BuddyAllocator(16384, {minSize: 16});
```

Allocate some blocks, and remember to free them later.
```javascript
var block = buddy.alloc(960);
buddy.free(block);
```

Keep an eye on internal fragmentation with powerful analytics tools!
```javascript
var frag = buddy.bytesWasted / buddy.bytesAllocated;
console.log('Internal fragmentation: %d%%', frag * 100);
```

Benchmark
---------
You can use the code included in `/bench` for some quick benchmark runs.
First, generate some sample data representing allocations sizes.
```
sh bench/genzipf.sh 1.0 65535 1000000
```
Next, run the benchmark script.
```
node bench/buddy.js --minSize=256 bench/zipf-1.0-65535-1000000.dat
```
```javascript
{ allocations:
   { meter:
      { count: 1000000,
        current: 85650.16091444057,
        mean: 85649.74822481262,
        m1: 13301.944422118831,
        m5: 2836.972973278335,
        m15: 955.978272946682 },
     histogram:
      { min: 1,
        max: 65535,
        sum: 5608305454,
        stddev: 12340.756251252693,
        variance: 152294264.8528324,
        count: 1000000,
        mean: 5608.305454,
        median: 151.5,
        p75: 3797.25,
        p95: 37887.79999999998,
        p99: 60253.19,
        p999: 65145.578 } },
  bytes:
   { requested: 5608305454,
     allocated: 191756057,
     wasted: 76679399,
     total: 268435456 } }
```

License
-------

The MIT License (MIT)

Copyright (c) 2014 Simon Ratner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
