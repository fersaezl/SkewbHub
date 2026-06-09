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

    const index = times.length;
    const time = (elapsedTime / 1000).toFixed(2);

    let ao5Text;
    if (ao5() !== null) {
        ao5Text = (ao5() / 1000).toFixed(2);
    } else {
        ao5Text = '-';
    }

    let ao12Text;
    if (ao12() !== null) {
        ao12Text = (ao12() / 1000).toFixed(2);
    } else {
        ao12Text = '-';
    }

    renderTable();
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

$(document).on('click', '.clickable-row', function () {
    const index = $(this).data('index');
    if (confirm('Delete this time?')) {
        times.splice(index, 1);
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