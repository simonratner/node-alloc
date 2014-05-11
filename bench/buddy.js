#!/usr/bin/env node

// node bench/buddy.js --minSize=512 bench/zipf-1.0-65535-10000.dat

var args = require('optimist').argv;

var Benchmark = require('./Benchmark');
var BuddyAllocator = require('..').BuddyAllocator;

var buddy = new BuddyAllocator(0xfffffff, args);
var bench = new Benchmark(buddy, args._[0]);
bench.run();
