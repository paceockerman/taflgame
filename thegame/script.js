socket = new WebSocket(
    `wss://free.blr2.piesocket.com/v3/99814?api_key=OvCz2lDHgmuHuSURiXSoPfd6nzyvg1RkRqeCBLSg`
);


function allowDrop(ev) {
    ev.preventDefault();
}
let objectCount = 0;
function drag(event) {
    event.dataTransfer.setData("text", event.target.textContent);
    event.dataTransfer.setData("id", event.target.id);
}

function drop(event) {
    event.preventDefault();
    const draggedNumber = parseInt(event.dataTransfer.getData("text"), 10);
    const draggedId = event.dataTransfer.getData("id");
    const boxId = event.target.id; // e.g., "box1"
    const boxNumber = parseInt(boxId.replace("box", ""), 10) - 1;
    const currentNumber = parseInt(event.target.textContent, 10);

    if (hands[player].includes(draggedNumber) && numGoesOnDiscard(draggedNumber, boxNumber)) {
        idx = hands[player].indexOf(draggedNumber)
        discards[boxNumber] = draggedNumber
        hands[player].splice(idx, 1)
        event.target.textContent = draggedNumber;
        document.getElementById(draggedId).remove();
    }
    processEvent()
}


function removeAllCards() {
    const objectsContainer = document.getElementById("objectsContainer");
    objectsContainer.innerHTML = ""; // Clear all content inside the container
}

function addCard(number) {
    // Create a new card
    objectCount++;
    const newCard = document.createElement("div");
    newCard.className = "object";
    newCard.id = `object${objectCount}`;
    newCard.textContent = number;
    newCard.draggable = true;
    newCard.ondragstart = drag;

    // Append the new card to the objects container
    document.getElementById("objectsContainer").appendChild(newCard);
}

// GAME STARTS HERE ---------------------------
let player = 0

discards = [1, 1, 100, 100]
deck = Array.from({ length: 98 }, (v, k) => k + 2)
shuffle(deck)
hands = [[], []]

socket.onmessage = (event) => {
    inc = JSON.parse(event.data)
    deck = inc.deck
    hands = inc.hands
    discards = inc.discards
    displayGame()
}

function changePlayer() {
    player = (player + 1) % 2
    document.getElementById('changePlayerButton').innerHTML = `Player ${player + 1}`
    processEvent()
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function numGoesOnDiscard(num, dsc) {
    if (dsc == 0 || dsc == 1) {
        if (num > discards[dsc] || num == discards[dsc] - 10)
            return true
        return false
    } else if (dsc == 2 || dsc == 3) {
        if (num < discards[dsc] || num == discards[dsc] + 10)
            return true
        return false
    }
    return false
}

function fillHands(index, target = 7) {
    numToDraw = target - hands[index].length
    numToDraw2 = target - hands[(index + 1) % 2].length

    for (var i = 0; i < numToDraw; i++) {
        cardToAdd = deck.pop()
        if (cardToAdd !== undefined)
            hands[index].push(cardToAdd)
    }
    for (var i = 0; i < numToDraw2; i++) {
        cardToAdd = deck.pop()
        if (cardToAdd !== undefined)
            hands[(index + 1) % 2].push(cardToAdd)
    }
    processEvent()
}

function processEvent() {
    socket.send(JSON.stringify({
        "deck": deck,
        "hands": hands,
        "discards": discards
    }))
    displayGame()
}

function displayGame() {
    removeAllCards()
    stc = hands[player].sort((a, b) => a - b)
    for (const num of stc) {
        addCard(num)
    }
    document.getElementById("box1").innerHTML = discards[0]
    document.getElementById("box2").innerHTML = discards[1]
    document.getElementById("box3").innerHTML = discards[2]
    document.getElementById("box4").innerHTML = discards[3]
    document.getElementById("numleft").innerHTML = deck.length
}
