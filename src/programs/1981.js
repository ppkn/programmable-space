const { room, myId, run } = require('../helpers/helper')(__filename);

// xhen camera sees frame $frame @ $:
room.on(`camera $ screenshot $frame`,
        results => {
  room.subscriptionPrefix(1);
  if (!!results && results.length > 0) {
    results.forEach(({ frame }) => {
let ill = room.newIllumination()
ill.fontsize(30)
ill.scale(5, 5)
ill.image(0, 0, 192, 108, frame)
room.draw(ill);


    });
  }
  room.subscriptionPostfix();
})


run();
