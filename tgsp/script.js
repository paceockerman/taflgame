
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

    if (hand.includes(draggedNumber) && numGoesOnDiscard(draggedNumber, boxNumber)) {
        idx = hand.indexOf(draggedNumber)
        discards[boxNumber] = draggedNumber
        hand.splice(idx, 1)
        event.target.textContent = draggedNumber;
        document.getElementById(draggedId).remove();
    }
    processEvent()
}


function removeAllCards() {
    const objectsContainer = document.getElementById("objectsContainer");
    objectsContainer.innerHTML = ""; // Clear all content inside the container
}

function addCard(number, isNew = false) {
    // Create a new card
    objectCount++;
    const newCard = document.createElement("div");
    newCard.className = "object";
    newCard.id = `object${objectCount}`;
    newCard.textContent = number;
    newCard.draggable = true;
    newCard.ondragstart = drag;
    if (isNew) {
        newCard.classList.add("yellow")
    }

    // Append the new card to the objects container
    document.getElementById("objectsContainer").appendChild(newCard);
}


discards = [1, 1, 100, 100]
hand = []
nc = [];

deck = Array.from({ length: 98 }, (v, k) => k + 2)
shuffle(deck)
fillHand()
fillHand()



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

function fillHand(target = 8) {
    numToDraw = target - hand.length
    nci = []

    for (var i = 0; i < numToDraw; i++) {
        cardToAdd = deck.pop()
        if (cardToAdd !== undefined) {
            hand.push(cardToAdd)
            nci.push(cardToAdd)
        }
    }
    processEvent()
}

function processEvent() {
    displayGame()
}

function displayGame() {
    removeAllCards()
    stc = hand.sort((a, b) => a - b)
    for (const num of stc) {
        if (nci.includes(num)) addCard(num, true)
        else addCard(num, false)

    }
    document.getElementById("box1").innerHTML = discards[0]
    document.getElementById("box2").innerHTML = discards[1]
    document.getElementById("box3").innerHTML = discards[2]
    document.getElementById("box4").innerHTML = discards[3]
    document.getElementById("numleft").innerHTML = deck.length + " cards"
    document.getElementById("cardsleft").innerHTML = deck.toSorted((a, b) => a - b).join(", ")
}
