// Timer state:
// - isReady: space (or touch) is held down and we wait for the release to start
// - isRunning: the clock is ticking; the next space (or touch) stops it
let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let isRunning = false;
let isReady = false;
let msgStart;
let msgStop;

// Different instructions for touch screens
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
    // Date.now() instead of counting intervals, because setInterval is not exact
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

    renderTable();

    // newScramble lives in scrambler.js (a module), so it may not exist yet
    if (window.newScramble) {
        window.newScramble();
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    elapsedTime = 0;
    isRunning = false;
    updateDisplay();
    $('#timer-status').text(msgStart);
}

// Keyboard: press space = ready, release = start, press again = stop
$(document).on('keydown', function (e) {
    if (e.code === 'Space') {
        e.preventDefault(); // avoid scrolling the page
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

// Touch: same logic as the keyboard. The listener is not passive so that preventDefault() can stop the page from scrolling and the emulated mouse events.
document.getElementById('timer-section').addEventListener('touchstart', function (e) {
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

$('#btn-clear').on('click', function () {
    clearTimes();
    resetTimer();
    $('#times-body').empty();
    $('#ao5').text('-');
    $('#ao12').text('-');
    $('#pb').text('-');
});

// Delegated event, because renderTable() recreates the rows every time. data-index is the position of the time in the times array.
$(document).on('click', '.clickable-row', function () {
    const index = $(this).data('index');
    if (confirm('Delete this time?')) {
        times.splice(index, 1);
        localStorage.setItem('times', JSON.stringify(times)); // otherwise the time comes back after reloading
        renderTable();

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

        if (times.length > 0) {
            $('#pb').text((pb() / 1000).toFixed(2));
        } else {
            $('#pb').text('-');
        }
    }
});