let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let isRunning = false;
let isReady = false;
let msgStart;
let msgStop;

if ('ontouchstart' in window) {
    msgStart = 'Hold to start';
    msgStop = 'Tap to stop';
} else {
    msgStart = 'Press space to start';
    msgStop = 'Press space to stop';
}

function updateDisplay() {
    let seconds = (elapsedTime / 1000).toFixed(2);
    $('#timer').text(seconds);
}

function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(function () {
        elapsedTime = Date.now() - startTime;
        updateDisplay();
    }, 10);
    isRunning = true;
    $('#timer-status').text(msgStop);
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    $('#timer-status').text(msgStart);
    addTime(elapsedTime);
    if (ao5() !== null) {
        $('#ao5').text((ao5() / 1000).toFixed(2));
    } else {
        $('#ao5').text('-');
    }

    if (ao12() !== null) {
        $('#ao12').text((ao12() / 1000).toFixed(2));
    } else {
        $('#ao12').text('-');
    }

    $('#pb').text((pb() / 1000).toFixed(2));
}

function resetTimer() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    isRunning = false;
    updateDisplay();
    $('#timer-status').text(msgStart);
}

$(document).on('keydown', function (e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
            stopTimer();
        } else if (!isReady) {
            resetTimer();
            isReady = true;
            $('#timer').addClass('ready');
            $('#timer-status').text('Release to start');
        }
    }
});

document.addEventListener('touchstart', function (e) {
    e.preventDefault();
    if (isRunning) {
        stopTimer();
    } else if (!isReady) {
        resetTimer();
        isReady = true;
        $('#timer').addClass('ready');
        $('#timer-status').text('Release to start');
    }
}, { passive: false });

$(document).on('keyup', function (e) {
    if (e.code === 'Space') {
        if (isReady) {
            isReady = false;
            $('#timer').removeClass('ready');
            startTimer();
        }
    }
});

$(document).on('touchend', function (e) {
    if (isReady) {
        isReady = false;
        $('#timer').removeClass('ready');
        startTimer();
    }
});

$('#timer-status').text(msgStart);