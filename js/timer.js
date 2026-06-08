let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let isRunning = false;
let isReady = false;

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
    $('#timer-status').text('Press space to stop');
}

function stopTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    $('#timer-status').text('Press space to start');
}

function resetTimer() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    isRunning = false;
    updateDisplay();
    $('#timer-status').text('Press space to start');
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

$(document).on('keyup', function (e) {
    if (e.code === 'Space') {
        if (isReady) {
            isReady = false;
            $('#timer').removeClass('ready');
            startTimer();
        }
    }
});