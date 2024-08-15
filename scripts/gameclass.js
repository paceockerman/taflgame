class Game {
    constructor(board) {
        this.states = [new State(board)]
        this.moves = []
    }
    applyMove(move, fromRemote) {
        let newState = this.state.getCopy()
        if (newState.movePiece(move) != -1) {
            this.states.push(newState)
            this.moves.push(move)
            drawCanvas()
            if (!fromRemote) {
                socket.send(JSON.stringify({
                    "event": "game:move",
                    "data": {
                        "move": move
                    }
                }))
            }
        }
        return newState
    }

    undo() {
        if (this.moves.length > 0) {
            this.states.pop()
            this.moves.pop()
            drawCanvas()
        }
        return this.state
    }

    end(winner) {
        console.log(`Player ${winner + 1} has won the game!`)
        playerNumber = -1
        for (const timer in timers) {
            timers[timer].stop()
        }
    }

    get state() {
        return this.states[this.states.length - 1]
    }

    get movelist() {
        return this.moves
    }
}

