// Each solve is an object: { ms: 12340, penalty: 'none', scramble: "R U' L B" }
// - ms is the time measured by the timer, it is never modified
// - penalty will be 'none', 'plus2' (+2 seconds) or 'dnf' (did not finish)
// - scramble is the scramble that was solved ('' for solves saved before it existed)
const times = [];

function saveTimes() {
    localStorage.setItem('times', JSON.stringify(times));
}

function addTime(ms, scramble) {
    times.push({ ms: ms, penalty: 'none', scramble: scramble || '' });
    saveTimes();
}

// Changes the penalty of one solve: 'none', 'plus2' or 'dnf'
function setPenalty(index, penalty) {
    times[index].penalty = penalty;
    saveTimes();
}

function deleteTime(index) {
    times.splice(index, 1);
    saveTimes();
}

// The time that counts for a solve, in milliseconds.
// Every calculation (pb, averages, table) uses this instead of solve.ms, so the penalties only have to be handled here.
// A DNF is Infinity, so it is always the worst one when sorting, and any sum or average that includes it is Infinity too
function effectiveTime(solve) {
    if (solve.penalty === 'dnf') {
        return Infinity;
    }
    if (solve.penalty === 'plus2') {
        return solve.ms + 2000;
    }
    return solve.ms;
}

// Personal best. DNF can never be the best and if all of them are DNF, there is no pb
function pb() {
    const valid = times.map(effectiveTime).filter(isFinite);
    if (valid.length === 0) {
        return null;
    }
    return Math.min(...valid);
}

// Average of the n solves that end at endIndex (WCA style): the best and the worst are dropped and the rest are averaged. Returns null if there are not enough solves yet
function averageAt(n, endIndex) {
    if (endIndex + 1 < n) {
        return null;
    }
    const window = times.slice(endIndex + 1 - n, endIndex + 1).map(effectiveTime);

    const sorted = [...window].sort(function (a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    });

    const trimmed = sorted.slice(1, n - 1);

    // One DNF is the worst time and gets dropped, as in the WCA rules. If a DNF is still left after dropping, there were two or more the average is DNF
    if (trimmed.includes(Infinity)) {
        return Infinity;
    }

    return trimmed.reduce((sum, t) => sum + t, 0) / trimmed.length;
}

// Current averages (the last n solves)
function ao5() {
    return averageAt(5, times.length - 1);
}

function ao12() {
    return averageAt(12, times.length - 1);
}

function clearTimes() {
    times.length = 0;
    localStorage.removeItem('times');
}

// Milliseconds to seconds with 2 decimals, or '-' when there is no value, 'DNF' for a DNF
function formatTime(ms) {
    if (ms === null) {
        return '-';
    }
    if (ms === Infinity) {
        return 'DNF';
    }
    return (ms / 1000).toFixed(2);
}

// How a solve is shown in the table: 12.34, 12.34+ (with +2) or DNF
function formatSolve(solve) {
    if (solve.penalty === 'plus2') {
        return formatTime(effectiveTime(solve)) + '+';
    }
    return formatTime(effectiveTime(solve));
}

// Lowest value of a list, ignoring nulls. Values are compared as displayed (2 decimals), so two averages that look the same are both highlighted
function bestShown(values) {
    let best = null;
    for (let i = 0; i < values.length; i++) {
        if (values[i] === null || values[i] === Infinity) {
            continue; // no value, or DNF
        }
        const shown = parseFloat(formatTime(values[i]));
        if (best === null || shown < best) {
            best = shown;
        }
    }
    return best;
}

// Shows ao5, ao12 and pb in the summary under the timer
function updateSummary() {
    $('#ao5').text(formatTime(ao5()));
    $('#ao12').text(formatTime(ao12()));
    $('#pb').text(formatTime(pb()));
}

function renderTable() {
    $('#times-body').empty();

    // ao5 and ao12 as they were after each solve
    const ao5List = [];
    const ao12List = [];
    for (let i = 0; i < times.length; i++) {
        ao5List.push(averageAt(5, i));
        ao12List.push(averageAt(12, i));
    }

    const bestAo5 = bestShown(ao5List);
    const bestAo12 = bestShown(ao12List);
    const pbVal = pb();

    // Newest solve first, so each row is prepended
    for (let i = 0; i < times.length; i++) {
        let timeClass = '';
        if (effectiveTime(times[i]) === pbVal) {
            timeClass = 'highlight-pb';
        }

        let ao5Class = '';
        if (ao5List[i] !== null && parseFloat(formatTime(ao5List[i])) === bestAo5) {
            ao5Class = 'highlight-ao';
        }

        let ao12Class = '';
        if (ao12List[i] !== null && parseFloat(formatTime(ao12List[i])) === bestAo12) {
            ao12Class = 'highlight-ao';
        }

        $('#times-body').prepend(
            '<tr class="clickable-row" data-index="' + i + '">' +
            '<td>' + (i + 1) + '</td>' +
            '<td class="' + timeClass + '">' + formatSolve(times[i]) + '</td>' +
            '<td class="' + ao5Class + '">' + formatTime(ao5List[i]) + '</td>' +
            '<td class="' + ao12Class + '">' + formatTime(ao12List[i]) + '</td>' +
            '</tr>'
        );
    }
}

// Loads the saved times
const saved = localStorage.getItem('times');
if (saved) {
    const loaded = JSON.parse(saved);
    for (let i = 0; i < loaded.length; i++) {
        if (typeof loaded[i] === 'number') {
            times.push({ ms: loaded[i], penalty: 'none', scramble: '' });
        } else {
            times.push(loaded[i]);
        }
    }
    // Save right away in the new format
    saveTimes();
    renderTable();
    updateSummary();
}