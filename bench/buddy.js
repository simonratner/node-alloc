#!/usr/bin/env node

// node bench/buddy.js --minSize=256 bench/zipf-1.0-65535-1000000.dat

var args = require('optimist').argv;

var Benchmark = require('./Benchmark');
var BuddyAllocator = require('..').BuddyAllocator;

var buddy = new BuddyAllocator(0xfffffff, args);
var bench = new Benchmark(buddy, args._[0]);
bench.run(function(err) {
  if (err) {
    console.error(err);
  } else {
    console.dir(bench.stats.toJSON());
  }
});
