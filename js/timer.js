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

    // The scramble on screen is the one that was just solved (the new one is created below)
    let currentScramble = '';
    if (window.getCurrentScramble) {
        currentScramble = window.getCurrentScramble();
    }
    addTime(elapsedTime, currentScramble);

    updateSummary();
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
    if (isModalOpen()) {
        return;
    }

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
    updateSummary();
});

// Options of a solve (click on a row of the table)
const solveModal = new bootstrap.Modal(document.getElementById('solve-modal'));
let selectedIndex = null; // position of the solve shown in the dialog

function isModalOpen() {
    return $('#solve-modal').hasClass('show');
}

// Fills the dialog with the data of the selected solve
function fillSolveModal() {
    const solve = times[selectedIndex];
    $('#solve-modal-title').text('Solve ' + (selectedIndex + 1));
    $('#solve-modal-time').text(formatSolve(solve));

    if (solve.scramble) {
        $('#solve-modal-scramble').text(solve.scramble);
    } else {
        $('#solve-modal-scramble').text('Scramble not saved');
    }

    $('.btn-penalty').removeClass('active');
    $('.btn-penalty[data-penalty="' + solve.penalty + '"]').addClass('active');
}

// Delegated event, because renderTable() recreates the rows every time, data-index is the position of the time in the times array
$(document).on('click', '.clickable-row', function () {
    if (isRunning) {
        return; // do not open the dialog while the timer is running
    }
    selectedIndex = $(this).data('index');
    fillSolveModal();
    solveModal.show();
});

$('.btn-penalty').on('click', function () {
    setPenalty(selectedIndex, $(this).data('penalty'));
    renderTable();
    updateSummary();
    solveModal.hide();
});

$('#btn-delete-solve').on('click', function () {
    deleteTime(selectedIndex);
    renderTable();
    updateSummary();
    solveModal.hide();
});