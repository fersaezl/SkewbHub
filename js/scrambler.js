// Scramble generation. Loaded as a module (type="module" in index.html)

// The official scrambler comes from cubing.js. It is loaded with a dynamic import because the CDN can fail, in that case a simpler scramble is used, so the app never ends up without one.

// null until the official scrambler has loaded correctly
let randomScrambleForEvent = null;

async function loadOfficialScrambler() {
    try {
        const scrambleModule = await import("https://cdn.cubing.net/v0/js/cubing/scramble");
        randomScrambleForEvent = scrambleModule.randomScrambleForEvent;
    } catch (error) {
        console.warn('Official scrambler not available, using backup', error);
    }
}

// Backup: random moves, never the same face twice in a row. It is not a WCA random-state scramble, but it is good enough to practice.
function generateBackupScramble() {
    const faces = ['R', 'L', 'U', 'B'];
    const scramble = [];
    let lastFace = '';

    while (scramble.length < 11) {
        const face = faces[Math.floor(Math.random() * faces.length)];
        if (face === lastFace) {
            continue;
        }
        if (Math.random() < 0.5) {
            scramble.push(face);
        } else {
            scramble.push(face + "'");
        }
        lastFace = face;
    }

    return scramble.join(' ');
}

// Official scramble if possible, backup if not
async function getScramble() {
    if (randomScrambleForEvent) {
        try {
            const scramble = await randomScrambleForEvent('skewb');
            return scramble.toString();
        } catch (error) {
            console.warn('Official scramble failed, using backup', error);
        }
    }
    return generateBackupScramble();
}

// Every scramble shown so far, so the user can go back to the previous ones.
// scrambleIndex is the position of the scramble currently on screen.
const scrambleHistory = [];
let scrambleIndex = -1;

function showScramble(text) {
    $('#scramble').text(text);
    drawScramble(text);
    // There is nothing before the first scramble, so "previous" is disabled there
    $('#btn-prev-scramble').prop('disabled', scrambleIndex <= 0);
}

// Generates a new scramble and adds it at the end of the history
async function newScramble() {
    const text = await getScramble();
    scrambleHistory.length = scrambleIndex + 1;
    scrambleHistory.push(text);
    scrambleIndex = scrambleHistory.length - 1;
    showScramble(text);
}

function previousScramble() {
    if (scrambleIndex > 0) {
        scrambleIndex--;
        showScramble(scrambleHistory[scrambleIndex]);
    }
}

// If we went back, "next" shows the saved scramble; at the end it makes a new one
async function nextScramble() {
    if (scrambleIndex < scrambleHistory.length - 1) {
        scrambleIndex++;
        showScramble(scrambleHistory[scrambleIndex]);
    } else {
        await newScramble();
    }
}

$('#btn-prev-scramble').on('click', previousScramble);
$('#btn-next-scramble').on('click', nextScramble);

// A module has its own scope, so timer.js can only reach this function through window
window.newScramble = newScramble;

// The first scramble waits for the load attempt, so the official one is used when possible
loadOfficialScrambler().then(newScramble);