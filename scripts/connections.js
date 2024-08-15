var socket = null

function connectToServer(roomNumber = 0) {
    roomNumber = prompt("Enter Room Number")
    if (roomNumber == null || roomNumber == 0)
        return

    showGame()


    socket = new WebSocket(
        `wss://free.blr2.piesocket.com/v3/presence-${roomNumber}?api_key=OvCz2lDHgmuHuSURiXSoPfd6nzyvg1RkRqeCBLSg`
    );

    socket.onopen = () => {
        console.log("Successfully connected to game server.")
    }

    socket.onmessage = (event) => {
        incoming = JSON.parse(event.data)
        eventType = incoming.event
        data = incoming.data

        switch (eventType) {
            case 'system:member_list':
                // this is when you join the room
                break;
            case 'system:member_joined':
                // this is when someone else joins (triggers on self join)

                // If its the second player, send them the setup
                if (data.members.length == 2) {
                    socket.send(JSON.stringify({
                        "event": "game:init",
                        "data": {
                            "playerNumber": 1 - playerNumber,
                            "timerLength": timerLength,
                            "timerIncrement": timerIncrement
                        }
                    }))
                    startTimers()
                    addClickListeners()
                }
                break;
            case 'system:member_left':
                // this is when someone leaves
                // probably reset the board and set everything to inactive?
                break;
            case 'game:init':
                // how to pass game info
                playerNumber = data.playerNumber
                timerLength = data.timerLength
                timerIncrement = data.timerIncrement
                break;
            case 'game:move':
                game.applyMove(data.move, true)
                break;
        }


    }

}



/*

system:member_list - on join
system:member_joined - on your and other joins
system:member_left - on other's leaving ### NO ACTION


game:init - send setup options (SETUP V QUICKSTART, TIME CONTROL, PLAYER NUMBER)
game:move - send moves to opponent




*/