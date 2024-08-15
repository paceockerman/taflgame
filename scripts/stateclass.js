class State {
    constructor(board, currentTurn = 0, hasSecondMove = true, lastTurnMoves = [], recentMove = [], winner = null) {
        this.board = board
        this.currentTurn = currentTurn
        this.hasSecondMove = hasSecondMove
        // Moves from the last (other players) turn
        this.lastTurnMoves = lastTurnMoves
        // First move from player turn
        this.recentMove = recentMove
        this.winner = winner
    }

    getCopy() {
        return new State(
            JSON.parse(JSON.stringify(this.board)),
            this.currentTurn,
            this.hasSecondMove,
            [...this.lastTurnMoves],
            [...this.recentMove],
            this.winner
        )
    }

    getLastTurnMoves() {
        return this.lastTurnMoves
    }

    getRecentMoveState() {
        return this.recentMove
    }

    getEligiblePieces() {
        let activePieces = []
        let inactivePieces = []
        // Iterate over the board
        for (let x = 0; x <= 10; x++) {
            for (let y = 0; y <= 10; y++) {
                let v = this.board[x][y]
                let r = this.recentMove
                if (v == 0)
                    continue
                // Pass on empty elements and the last move & center piece on second move
                if (!this.hasSecondMove && (v == 4 || (r[2] == x && r[3] == y))) {
                    inactivePieces.push([x, y])
                }
                else if (this.board[x][y] % 2 == this.currentTurn)
                    activePieces.push([x, y])
                else
                    inactivePieces.push([x, y])
            }
        }
        return [activePieces, inactivePieces]
    }

    isLegalMove(x_i, y_i, x_f, y_f) {
        // TODO parseInt to make sure x_i and y_i are [0,10] ints
        // Returns -1 if illegal, otherwise isAttack
        let legalStraightMoves = this.getLegalStraightMoves(x_i, y_i)
        let legalAttackMoves = this.getLegalAttackMoves(x_i, y_i)
        if (legalStraightMoves.findIndex((e) => e[0] == x_f && e[1] == y_f) != -1)
            return false
        else if (legalAttackMoves.findIndex((e) => e[0] == x_f && e[1] == y_f) != -1)
            return true
        else
            return -1
    }

    isNonzero(x, y) {
        return this.board[x][y] != 0
    }

    changeTurn() {
        if (isTimedGame) {
            var currentTimeLeft = timers[this.currentTurn].getTotalTimeValues().seconds
            var newTimeLeft = Math.min(currentTimeLeft + timerIncrement, timerLength)
            timers[this.currentTurn].stop()
            timers[this.currentTurn].start({ countdown: true, startValues: { seconds: newTimeLeft } })
            updateCirclePercent(this.currentTurn)
            timers[this.currentTurn].pause()
            timers[this.currentTurn ^ 1].start()
        }
        this.currentTurn ^= 1
    }

    movePiece(move) {
        let x_i, y_i, x_f, y_f, isAttack
        [x_i, y_i, x_f, y_f, isAttack] = move

        // this is checked here again to make it harder to send opponent illegal moves
        if (this.isLegalMove(x_i, y_i, x_f, y_f) == -1)
            return -1
        // Get starting piece value, move it, then empty the square
        let value = this.board[x_i][y_i]
        if (this.board[x_f][y_f] == 4)
            this.winner = 1
        if (value == 4 && (x_f == 0 || x_f == 10 || y_f == 0 || y_f == 10))
            this.winner = 0
        this.board[x_f][y_f] = value
        this.board[x_i][y_i] = 0

        isAttack = x_i != x_f && y_i != y_f

        // Fix the moves and the turns
        // Enforce lastturnmoves always maintains the previous turns moves
        if (isAttack || value == 4) {
            this.changeTurn()
            this.hasSecondMove = true
            // Add the first move played to recent move
            this.recentMove = []
            // Clear lastturnmoves as we are moving onto a new turn
            this.lastTurnMoves = [move]
        } else {
            if (this.hasSecondMove) {
                this.recentMove = move
                this.hasSecondMove = false
            } else {
                this.changeTurn()
                this.hasSecondMove = true
                this.lastTurnMoves = [this.recentMove, move]
                this.recentMove = []
            }
        }
        return 0
    }

    getLegalStraightMoves(x, y) {
        /* Return an empty array if any of the following are met
        *   - The piece does not belong to the active player
        *   - There has already been a move, and this is the centerpiece
        *   - There was a previously played action of this piece
        */
        let v = this.board[x][y]
        let r = this.recentMove
        if (v % 2 != this.currentTurn || (!this.hasSecondMove && v == 4) || (r.length > 0 && r[2] == x && r[3] == y))
            return []

        let moves = []
        let newX, newY
        // right, left, up, down
        let directions = [[1, 0, 0], [-1, 0, 1], [0, 1, 2], [0, -1, 3]]
        let canGoDirection = [true, true, true, true]
        for (var i = 1; i <= 10; i++) {
            for (const direction of directions) {
                if (canGoDirection[direction[2]]) {
                    newX = x + i * direction[0]
                    newY = y + i * direction[1]
                    if ((newX >= 0 && newX <= 10 && newY >= 0 && newY <= 10) && this.board[newX][newY] == 0)
                        moves.push([newX, newY])
                    else
                        canGoDirection[direction[2] = false]
                }
            }
        }
        return moves
    }

    getLegalAttackMoves(x, y) {
        /* Return an empty array if any of the following are met
         *  - the piece on the square does not belong to the active player
         *  - the player has already taken a first action
        */
        if (this.board[x][y] % 2 != this.currentTurn || !this.hasSecondMove)
            return []

        let moves = []
        let newX, newY
        let teamOfCurrentPlayer = this.board[x][y] % 2
        let directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]

        for (const direction of directions) {
            newX = x + direction[0]
            newY = y + direction[1]
            // Continue if out of bounds

            if (!(newX >= 0 && newX <= 10 && newY >= 0 && newY <= 10))
                continue
            // Continue if destination value has no piece
            if (this.board[newX][newY] == 0)
                continue
            // Add attacks on opposing pieces to legal moves
            if (this.board[newX][newY] % 2 != teamOfCurrentPlayer)
                moves.push([newX, newY])
        }
        return moves
    }
}