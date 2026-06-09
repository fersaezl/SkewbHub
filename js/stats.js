const times = [];

function addTime(ms) {
    times.push(ms);
}

function pb() {
    if (times.length === 0) {
        return null;
    }
    return Math.min(...times);
}

function ao5() {
    if (times.length < 5) {
        return null;
    }
    const last5 = times.slice(-5);
    const sorted = [...last5].sort((a, b) => a - b);
    const trimmed = sorted.slice(1, 4);
    return trimmed.reduce((sum, t) => sum + t, 0) / 3;
}

function ao12() {
    if (times.length < 12) {
        return null;
    }
    const last12 = times.slice(-12);
    const sorted = [...last12].sort((a, b) => a - b);
    const trimmed = sorted.slice(1, 11);
    return trimmed.reduce((sum, t) => sum + t, 0) / 10;
}

function clearTimes() {
    times.length = 0;
}

function renderTable() {
    $('#times-body').empty();
    for (let i = 0; i < times.length; i++) {
        const subset = times.slice(0, i + 1);
        const time = (times[i] / 1000).toFixed(2);

        let ao5Text = '-';
        if (subset.length >= 5) {
            const last5 = subset.slice(-5);
            const sorted = [...last5].sort((a, b) => a - b);
            const trimmed = sorted.slice(1, 4);
            ao5Text = (trimmed.reduce((sum, t) => sum + t, 0) / 3 / 1000).toFixed(2);
        }

        let ao12Text = '-';
        if (subset.length >= 12) {
            const last12 = subset.slice(-12);
            const sorted = [...last12].sort((a, b) => a - b);
            const trimmed = sorted.slice(1, 11);
            ao12Text = (trimmed.reduce((sum, t) => sum + t, 0) / 10 / 1000).toFixed(2);
        }

        $('#times-body').prepend('<tr class="clickable-row" data-index="' + i + '"><td>' + (i + 1) + '</td><td>' + time + '</td><td>' + ao5Text + '</td><td>' + ao12Text + '</td></tr>');
    }
}