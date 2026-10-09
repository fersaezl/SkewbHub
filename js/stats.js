// Each solve is an object: { ms: 12340, penalty: 'none' }
// - ms is the time measured by the timer, it is never modified
// - penalty will be 'none', 'plus2' or 'dnf' (for now every solve is 'none')
const times = [];

function addTime(ms) {
    times.push({ ms: ms, penalty: 'none' });
    localStorage.setItem('times', JSON.stringify(times));
}

// The time that counts for a solve, in milliseconds.
// Every calculation (pb, averages, table) uses this instead of solve.ms, so the penalties only have to be handled here.
function effectiveTime(solve) {
    return solve.ms;
}

function pb() {
    if (times.length === 0) {
        return null;
    }
    return Math.min(...times.map(effectiveTime));
}

// Average of the n solves that end at endIndex (WCA style): the best and the worst are dropped and the rest are averaged. Returns null if there are not enough solves yet
function averageAt(n, endIndex) {
    if (endIndex + 1 < n) {
        return null;
    }
    const window = times.slice(endIndex + 1 - n, endIndex + 1).map(effectiveTime);
    const sorted = [...window].sort((a, b) => a - b);
    const trimmed = sorted.slice(1, n - 1);
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

// Milliseconds to seconds with 2 decimals, or '-' when there is no value
function formatTime(ms) {
    if (ms === null) {
        return '-';
    }
    return (ms / 1000).toFixed(2);
}

// Lowest value of a list, ignoring nulls. Values are compared as displayed (2 decimals), so two averages that look the same are both highlighted
function bestShown(values) {
    let best = null;
    for (let i = 0; i < values.length; i++) {
        if (values[i] === null) {
            continue;
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
            '<td class="' + timeClass + '">' + formatTime(effectiveTime(times[i])) + '</td>' +
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
            times.push({ ms: loaded[i], penalty: 'none' });
        } else {
            times.push(loaded[i]);
        }
    }
    // Save right away in the new format
    localStorage.setItem('times', JSON.stringify(times));
    renderTable();
    updateSummary();
}