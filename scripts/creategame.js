var canvas, ctx, canvasSize, boxWidth, outlineBaseWidth

// Create room info variables
var roomNumber, playerNumber = -1


// Init drawing variables
var circleFillPercent = 3 / 8
let activeMarkerWidth = 1
let inactiveMarkerWidth = 1
var circlePercent = [3 * Math.PI / 2 + 2 * Math.PI, 3 * Math.PI / 2 + 2 * Math.PI]
var selectedPiece = null

// Init game class
board = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 2, 2, 2, 0, 0, 1, 0],
    [0, 1, 0, 2, 0, 0, 0, 2, 0, 1, 0],
    [0, 1, 0, 2, 0, 4, 0, 2, 0, 1, 0],
    [0, 1, 0, 2, 0, 0, 0, 2, 0, 1, 0],
    [0, 1, 0, 0, 2, 2, 2, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]
let game = new Game(board)

// Setup timer
var isTimedGame = false
var timerLength = 5
var timerIncrement = 5
var timers = [new easytimer.Timer(), new easytimer.Timer()]
for (const timer in timers) {
    timers[timer].addEventListener('secondsUpdated', (e) => updateCirclePercent(timer));
    // game.end accepts the winning number
    timers[timer].addEventListener('targetAchieved', (e) => game.end(1 - timer))
}
function updateCirclePercent(player) {
    let seconds = timers[player].getTotalTimeValues().seconds
    circlePercent[player] = 3 * Math.PI / 2 + 2 * Math.PI * seconds / timerLength
    drawCanvas(selectedPiece)
}
function startTimers() {
    timers[0].start({ countdown: true, startValues: { seconds: timerLength } });
    timers[1].start({ countdown: true, startValues: { seconds: timerLength } });
    timers[1].pause()
}

function createCanvas() {
    canvas = document.createElement('canvas')
    ctx = canvas.getContext("2d");


    sizeCanvas()

    canvas.style.position = "absolute";
    canvas.style.top = "0px"
    canvas.style.left = "0px"
    canvas.style.right = "0px"
    canvas.style.bottom = "0px"
    canvas.style.margin = "auto"
    canvas.style.border = "1px solid";

    document.getElementsByTagName("body")[0].appendChild(canvas);

}

function sizeCanvas() {
    canvasSize = Math.min(window.innerHeight, window.innerWidth) * 0.8
    boxWidth = canvasSize / 11
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    activeMarkerWidth = boxWidth / 15
    inactiveMarkerWidth = boxWidth / 25
}

function resizeCanvas() {
    if (canvas !== undefined) {
        sizeCanvas()
        drawCanvas()
    }
}

window.onresize = resizeCanvas

function hideUI() {
    const button = document.getElementById("startgamebutton");
    button.parentNode.removeChild(button)
}

function showGame() {
    hideUI()
    createCanvas()
    drawCanvas()

}

function addClickListeners() {
    canvas.addEventListener('mousedown', function (e) {
        const rect = canvas.getBoundingClientRect()
        // Get click and convert it to grid
        let x = Math.floor((e.clientX - rect.left) / boxWidth)
        let y = 10 - Math.floor((e.clientY - rect.top) / boxWidth)
        onClickActions(x, y)
    })
}