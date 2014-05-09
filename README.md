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
