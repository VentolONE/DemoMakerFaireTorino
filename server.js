var five = require("johnny-five"),
  PouchDB = require('pouchdb'),
  board, photoresistor, db;

board = new five.Board();

db = new PouchDB("http://localhost:5984/makerfaire")

board.on("ready", function() {

  // Create a new `photoresistor` hardware instance.
  photoresistor = new five.Sensor({
    pin: "A2",
    freq: 1000
  });

  // Inject the `sensor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    pot: photoresistor
  });

  var buffer = []

  // "data" get the current reading from the photoresistor
  photoresistor.on("data", function() {
    buffer.push({
      value: this.value,
      _id: Date.now().toString()
    })
    console.log(this.value)
    if (buffer.length == 10) {
      console.log('sending data')
      db.bulkDocs(buffer.slice(), function(err){
        console.info('done')
      })
      buffer = []
    }
  });
});
