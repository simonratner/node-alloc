/*
 * node bench/buddy.js 134217728 512 bench/zipf-1.0-65535-10000.dat
 */

var Benchmark = require('./Benchmark');
var BuddyAllocator = require('..').BuddyAllocator;

var buddy = new BuddyAllocator(parseInt(process.argv[2]), {minSize: parseInt(process.argv[3])});
var bench = new Benchmark(buddy, process.argv[4]);
bench.run();
