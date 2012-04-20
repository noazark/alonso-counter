#!/usr/bin/env node

var Counter = require('../lib/alonso-counter').Counter;

// TODO: CLI configuration

var counter = new Counter({
    name: "counter",
    debug: true
});

counter.start();