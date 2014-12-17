var gpio = require("pi-gpio");
var socket = require('socket.io-client')('https://avayah.herokuapp.com');
var radio = require('nrf').connect("/dev/spidev0.0", 24, 25);

radio.channel(0x4c).dataRate('1Mbps').crcBytes(2).autoRetransmit({count:15, delay:4000});
radio.begin(function () {
  var rx = radio.openPipe('rx', 0xE8E8F0F0E2);
  tx = radio.openPipe('tx', 0xE8E8F0F0E1);

  radio.printDetails();

  socket.on( 'connect', function(){

    socket.on( 'status', function( data ) {
      console.log(data);
      var toDevice = data.info[0].switchNum.toString() + '01';
      var b = new Buffer(4);
      b.writeUInt32BE(parseInt(toDevice), 0);
      tx.write(b);
    } );

    socket.emit('device-info', {
      'owner' : 'testfoo@gmail.com',
      'serial': 'red-22',
      'status': 'online1'
    });

    socket.on( 'disconnect', function(){} );

  } );

  tx.on('error', function (e) {
    console.warn("Error sending reply.", e);
  });

  rx.on('data', function (d) {
    console.log("Got response back:", d[31]);

    if(d[31]){
      var res = d[31].toString().split('');
    }
    console.log(res);
    socket.emit('device-update', {
     'owner' : 'testfoo@gmail.com',
     'serial': 'red-22',
     'status': 'online',
     'switchNum' : parseInt(res[0]),
     'state' : parseInt(res[2])
    });
  });

});
