var Hook = require('hook.io').Hook
  , redis = require('redis')
  , util = require('util')
  , database;

var Counter = exports.Counter = function(options) {
  var self = this;
  Hook.call(this, options);

  database = redis.createClient();

  self.on('hook::ready', function () {
    self.on('harvester::message::saved', self._incr);
    self.on('*::harvester::message::saved', self._incr);
  });
}

util.inherits(Counter, Hook);

Counter.prototype.type = "Counter";

Counter.prototype._incr = function(data, callback, sender) {
  var date = new Date(data.date)
    , year = date.getFullYear()
    , month = date.getMonth() + 1
    , day = date.getDate()
    , hour = date.getHours()
    , minute = date.getMinutes()
    , keys = [data.hostname, data.id, 'Y' + year, 'm' + month, 'd' + day, 'H' + hour, 'M' + minute]
    , ttl = [
        null,
        null,
        null,
        null,
        15552000,  // 180 days
        2592000,   // 30 days
        604800     // 7 days
      ]
    , keyLength = keys.length;

  // increment redis key
  for(var i=0; i < keyLength; i++) {
    var key = keys.join(':')
      , keyTtl = ttl[ttl.length - i - 1];
    
    database.incr(key)
    if(keyTtl) database.expire(key, keyTtl);

    // remove last key from hierarchy
    keys.pop();
  }
};
