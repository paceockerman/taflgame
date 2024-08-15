function lineBetween(x0, y0, x1, y1) {
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
}

function drawGrid() {
    for (i = 1; i <= 10; i++) {
        lineBetween(i * boxWidth, 0, i * boxWidth, canvasSize)
        lineBetween(0, i * boxWidth, canvasSize, i * boxWidth)
    }
}

function highlightBorder() {
    let borderSquares = []
    for (var i = 0; i < 10; i++)
        borderSquares.push([0, 10 - i], [10, i], [i, 0], [10 - i, 10])
    highlightSquares(borderSquares, "grey")
}

function drawCircle(x, y, color) {
    res = gridToPixel(x, y)
    ctx.beginPath()
    ctx.arc(...res[0], boxWidth * circleFillPercent, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
}

function drawActiveMarkers(squares, width, player) {
    ctx.lineWidth = width;
    for (const square of squares) {
        res = gridToPixel(...square)
        ctx.beginPath()
        let circ = circlePercent[game.state.board[square[0]][square[1]] % 2]
        ctx.arc(...res[0], boxWidth * circleFillPercent, 3 * Math.PI / 2, circ)
        ctx.stroke()
    }
    ctx.lineWidth = 1;
}

function highlightSquares(squares, color = "yellow", alpha = 0.2) {
    ctx.globalAlpha = alpha
    for (const square of squares) {
        res = gridToPixel(...square)
        ctx.fillStyle = color
        ctx.fillRect(...res[1], boxWidth, boxWidth)
    }
    ctx.globalAlpha = 1.0
}

function drawPieces() {
    for (var row = 0; row <= 10; row++) {
        for (var col = 0; col <= 10; col++) {
            if (game.state.board[row][col] == 1) {
                drawCircle(row, col, "silver")
            }
            if (game.state.board[row][col] == 2) {
                drawCircle(row, col, "gold")
            }
            if (game.state.board[row][col] == 4) {
                drawCircle(row, col, "orange")
            }
        }
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function drawCanvas(selectedPiece = null) {
    clearCanvas()
    highlightBorder()
    // TODO last move highlighting
    ltm = game.state.getLastTurnMoves()
    lastMoveHighlights = []
    trailHighlights = []
    for (const move of ltm) {
        lastMoveHighlights.push([move[2], move[3]])
        if (move[4]) {
            trailHighlights.push([move[0], move[1]])
        } else {
            xDiff = move[2] - move[0]
            yDiff = move[3] - move[1]
            for (var i = 0; i < Math.abs(xDiff); i++)
                trailHighlights.push([[move[0] + Math.sign(xDiff) * i], [move[1]]])
            for (var i = 0; i < Math.abs(yDiff); i++)
                trailHighlights.push([[move[0]], [move[1] + Math.sign(yDiff) * i]])
        }
    }
    highlightSquares(lastMoveHighlights, "green", 0.2)
    highlightSquares(trailHighlights, "green", 0.1)
    if (selectedPiece != null) {
        let legalStraightMoves = game.state.getLegalStraightMoves(...selectedPiece)
        let legalAttackMoves = game.state.getLegalAttackMoves(...selectedPiece)
        highlightSquares(legalStraightMoves)
        highlightSquares(legalAttackMoves, "red")
        highlightSquares([selectedPiece], "yellow", 0.4)
    }
    drawGrid()
    drawPieces()
    drawActiveMarkers(game.state.getEligiblePieces()[0], activeMarkerWidth)
    drawActiveMarkers(game.state.getEligiblePieces()[1], inactiveMarkerWidth)
}

function gridToPixel(x, y) {
    y = (10 - y) * boxWidth
    y1 = y + boxWidth
    x = x * boxWidth
    x1 = x + boxWidth
    // x_center, y_center, x_topleft, y_topleft
    return [[(x + x1) / 2, (y + y1) / 2], [x, y]]
}

function onClickActions(x, y) {

    // If there is a piece selected...
    if (selectedPiece != null) {
        // ... and a legal move played, do the action
        let isLegal = game.state.isLegalMove(...selectedPiece, x, y)
        if (isLegal != -1) {
            // Note that isLegal doubles as isAttack
            game.applyMove([...selectedPiece, x, y, isLegal])
            selectedPiece = null
        }
        // ... and it was clicked again, unselect it
        else if (selectedPiece[0] == x && selectedPiece[1] == y)
            selectedPiece = null
        // ... and another piece was clicked
        else if (game.state.isNonzero(x, y))
            selectedPiece = [x, y]
        else
            selectedPiece = null
    }
    // If the selected square has an unselected piece, select it
    else if (game.state.isNonzero(x, y))
        selectedPiece = [x, y]
    // Otherwise unselect
    else
        selectedPiece = null

    drawCanvas(selectedPiece)
}

function pixelToGrid(x, y) {
    x = Math.floor(x / boxWidth)
    y = Math.floor(y / boxWidth)
    return [x, 10 - y]
}

