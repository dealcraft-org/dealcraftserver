"use strict";
const EventEmitter = require("events");

class LegexaEmitter extends EventEmitter {
  constructor(){
  super();
  this.on("loggedIn", function(msg) {
    console.log("ases:"+msg);
  });

  }

}
const legexaEmitter = new LegexaEmitter();
//

module.exports = class Singleton {
  getInstance() {
    //console.log(Singleton.instance)
    if (!Singleton.instance) {
      Singleton.instance = new LegexaEmitter()
    }
    return Singleton.instance
  }
}

//





