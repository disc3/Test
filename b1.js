var nextPos = {
    x: 0,
    y: 0
};
var lastPos = {
    x: 0,
    y: 0
};
var nextSize = {
    hor: 0,
    vert: 0
};
var rectSizes = [{
    hor: 20,
    vert: 10,
    count: 0
}, {
    hor: 40,
    vert: 20,
    count: 0
}, {
    hor: 60,
    vert: 30,
    count: 0
}, {
    hor: 80,
    vert: 40,
    count: 0
}, {
    hor: 100,
    vert: 50,
    count: 0
}];
var touchedShape = false;
var turnCounter = 0;
var timer;
var distance;
var firstTurn;
var device;
var isLandscapeOriented;
var experimentData = [];
var turnData;
var errors;
/*
    These constants were determined by analyzing web pages for a desktop solution of 1920x1080.
    The max height has been reduced because the task bar is always visible (size for default task bar in Windows 10).
*/
const MAX_DESKTOP_WIDTH = 1920;
const MAX_DESKTOP_HEIGHT = 974;
const EXPERIMENT_DIMENSION = '1D';
const TIMESTAMP = new Date().toUTCString();

function setup() {
    // detect input device
    if (window.matchMedia('handheld').matches) {
        device = 'Smartphone';
        isLandscapeOriented = !window.matchMedia('orientation: landscape').matches;
    } else {
        device = 'Desktop / Laptop';
        // for the first distance. Saves the position of the cursor when the page gets loaded.
        lastPos.x = mouseX;
        lastPos.y = mouseY;
    }

    firstTurn = true;
    distance = 0;
}

function draw() {
    createCanvas(min(windowWidth, MAX_DESKTOP_WIDTH), min(windowHeight, MAX_DESKTOP_HEIGHT));
    background(100);
    fill(255, 0, 0);
    line(0, height / 2, width, height / 2);

    // Re-calc position whenever the shape's been clicked. Also calc if experiment runs for first time (i.e. first turn)
    if ((touchedShape == true && turnCounter <= 50) || firstTurn) {
        firstTurn = false;
        calcRandomPosition();
        turnCounter++;
        timer = performance.now();
        errors = 0;

    } else if (turnCounter > 50) {
        alert("You finished the exercise!");
        saveJSON(experimentData, TIMESTAMP + '.json');
        remove();
    }
    // reset boolean to "not clicked"
    touchedShape = false;

    // draw rectangle to screen
    fill(255, 0, 0);
    rect(nextPos.x, nextPos.y, nextSize.hor, nextSize.vert);
}

function calcRandomPosition() {
    const MAX_COUNT = 10;
    const MIN_DISTANCE = 30;
    let randomIndex;

    // protective clause to avoid infinite loop (because all counters are already maxed out)
    if (turnCounter > 50) {
        alert("You finished the exercise.");
        return;
    }

    // select random size. Check max amount while selecting
    do {
        randomIndex = int(random(rectSizes.length));
    } while (rectSizes[randomIndex].count == MAX_COUNT);

    nextSize = rectSizes[randomIndex];
    // calc random position while guaranteeing that the entire shape is visible on the screen.
    do {
        nextPos.x = int(random(width - nextSize.hor) % width);
    } while (int(dist(lastPos.x, lastPos.y, nextPos.x, lastPos.y)) < MIN_DISTANCE);
    // align at middle of height
    nextPos.y = height / 2 - nextSize.vert / 2;
    rectSizes[randomIndex].count++;
    // calc distance from last shape to the center of the current shape
    distance = dist(lastPos.x, lastPos.y, int(nextPos.x + nextSize.hor / 2), int(nextPos.y + nextSize.vert / 2));

    console.log("Distance between shapes: " + distance);

    lastPos.x = nextPos.x;
    lastPos.y = nextPos.y;
}

function mousePressed() {
    // clicked inside shape
    if ((mouseX >= nextPos.x) && (mouseX <= (nextPos.x + nextSize.hor)) && (mouseY >= nextPos.y) && (mouseY <= (nextPos.y + nextSize.vert))) {
        touchedShape = true;
        timer = performance.now() - timer;
        console.log("It took " + timer + " ms to click the shape.");

        turnData = {
            W: nextSize.hor,
            A: distance,
            time: timer,
            errCount: errors,
            inputDevice: device,
            dimensions: EXPERIMENT_DIMENSION,
            turn: turnCounter
        };
        experimentData.push(turnData);
        console.log("Last data tuple was:");
        console.log(turnData);
        // clicked outside of shape
    } else {
        errors++;
    }
}