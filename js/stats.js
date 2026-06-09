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