// Draws the Skewb as a flat net (6 faces, 30 stickers) in SVG and applies scrambles to it.
// Sticker index = face * 5 + position inside the face. Face order is in FACE_NAMES.

// ----- Settings -----
const FACE_SIZE = 95;   // length of one face edge, in pixels
const FACE_GAP = 5;     // empty space between faces (0 = faces touch each other)
const MARGIN = 5;       // empty space around the whole drawing

// Position 0 of each face is the center piece, positions 1-4 are the corner
// triangles, in the same order as the corners returned by getFaceCorners().
const FACE_NAMES = ['U', 'R', 'F', 'D', 'L', 'B'];

// Colors of the solved cube
const FACE_COLORS = {
    U: '#ffffff', // white
    R: '#e10000', // red
    F: '#009b48', // green
    D: '#ffd500', // yellow
    L: '#ff8000', // orange
    B: '#0046ad'  // blue
};

// ----- Geometry -----
// The net uses an isometric view: edges go in 3 directions
const SLOPE_X = FACE_SIZE * Math.cos(Math.PI / 6); // horizontal part of a sloped edge
const SLOPE_Y = FACE_SIZE / 2;                      // vertical part of a sloped edge
const SHIFT = (FACE_SIZE + FACE_GAP) / FACE_SIZE;   // how far a neighbour face is moved

// A face is a parallelogram: we need a starting point and two edge vectors. Returns its 4 corners in order.
function makeFace(start, edge1, edge2) {
    return [
        { x: start.x, y: start.y },
        { x: start.x + edge1.x, y: start.y + edge1.y },
        { x: start.x + edge1.x + edge2.x, y: start.y + edge1.y + edge2.y },
        { x: start.x + edge2.x, y: start.y + edge2.y }
    ];
}

// Corners of the 6 faces, in the same order as FACE_NAMES
function getFaceCorners() {
    const down = { x: 0, y: FACE_SIZE };
    const downRight = { x: SLOPE_X, y: SLOPE_Y };
    const downLeft = { x: -SLOPE_X, y: SLOPE_Y };
    const upRight = { x: SLOPE_X, y: -SLOPE_Y };

    // The three faces in the middle form the corner of the cube that stays fixed in WCA notation (UFR): U on top, F on the left and R on the right
    const faceU = makeFace({ x: 0, y: 0 }, downRight, downLeft);
    const faceF = makeFace({ x: -SLOPE_X, y: SLOPE_Y }, downRight, down);
    const faceR = makeFace({ x: 0, y: 2 * SLOPE_Y }, upRight, down);

    // The other three are unfolded next to them: L beside F, B beside R, D below F
    const faceL = makeFace({ x: -SLOPE_X - SLOPE_X * SHIFT, y: SLOPE_Y - SLOPE_Y * SHIFT }, downRight, down);
    const faceB = makeFace({ x: SLOPE_X * SHIFT, y: 2 * SLOPE_Y - SLOPE_Y * SHIFT }, upRight, down);
    const faceD = makeFace({ x: -SLOPE_X, y: SLOPE_Y + FACE_SIZE * SHIFT }, downRight, down);

    // Same order as FACE_NAMES: U, R, F, D, L, B
    return [faceU, faceR, faceF, faceD, faceL, faceB];
}

function middle(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// Splits one face into its 5 stickers: [0] = center piece, [1..4] = corner triangles
function getStickers(corners) {
    const mids = [];
    for (let i = 0; i < 4; i++) {
        mids.push(middle(corners[i], corners[(i + 1) % 4]));
    }

    // The center connects the 4 middle points of the face edges
    const stickers = [mids];

    // Each corner triangle: the corner + the 2 middle points next to it
    for (let i = 0; i < 4; i++) {
        stickers.push([corners[i], mids[i], mids[(i + 3) % 4]]);
    }
    return stickers;
}

// ----- Drawing -----
// colors: array of 30 colors (one per sticker)
function buildNetSvg(colors) {
    const faces = getFaceCorners();
    let polygons = '';
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (let f = 0; f < 6; f++) {
        const stickers = getStickers(faces[f]);

        for (let s = 0; s < 5; s++) {
            const index = f * 5 + s;
            const points = stickers[s].map(function (p) {
                minX = Math.min(minX, p.x);
                minY = Math.min(minY, p.y);
                maxX = Math.max(maxX, p.x);
                maxY = Math.max(maxY, p.y);
                return p.x.toFixed(2) + ',' + p.y.toFixed(2);
            }).join(' ');

            polygons += '<polygon data-index="' + index + '" points="' + points +
                '" fill="' + colors[index] + '" stroke="#000" stroke-width="1" stroke-linejoin="round"/>';
        }
    }

    // The viewBox is calculated from the polygons, so the SVG fits the drawing exactly and scales with its container (see #skewbs svg in styles.css)
    const viewBox = (minX - MARGIN) + ' ' + (minY - MARGIN) + ' ' +
        (maxX - minX + 2 * MARGIN) + ' ' + (maxY - minY + 2 * MARGIN);

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + viewBox + '">' + polygons + '</svg>';
}

// Colors of the solved cube: 5 stickers for each face
function solvedColors() {
    const colors = [];
    for (let f = 0; f < 6; f++) {
        for (let s = 0; s < 5; s++) {
            colors.push(FACE_COLORS[FACE_NAMES[f]]);
        }
    }
    return colors;
}

// Puts the drawing inside the element with id "skewbs". Default: solved cube
function drawSkewbNet(colors) {
    $('#skewbs').html(buildNetSvg(colors || solvedColors()));
}

// ----- Moves -----
// Model used to generate MOVES (x = right, y = up, z = front):
// - The fixed corner is UFR, the one in the middle of the net, as in WCA notation.
// - A move turns the half of the cube that contains one corner, clockwise when looking at that corner: U = UBL, R = DBR, L = DFL, B = DBL.
// - The lists were generated with a script from the 3D positions of the stickers and checked against a 3D Skewb with a real scramble.

// MOVES[move][i] is the place where sticker i goes after a clockwise turn. Stickers that do not move keep their own number.
const MOVES = {
    U: [20, 21, 22, 3, 24, 5, 6, 11, 8, 9, 10, 19, 12, 13, 14,
        15, 16, 17, 18, 7, 25, 27, 28, 23, 26, 0, 4, 1, 2, 29],
    R: [0, 1, 24, 3, 4, 25, 6, 28, 29, 26, 10, 11, 12, 2, 14,
        5, 16, 7, 8, 9, 20, 21, 22, 23, 13, 15, 19, 27, 17, 18],
    L: [0, 1, 2, 3, 9, 5, 6, 7, 8, 28, 15, 17, 12, 19, 16,
        20, 23, 24, 18, 22, 10, 21, 13, 14, 11, 25, 26, 27, 4, 29],
    B: [0, 14, 2, 3, 4, 5, 6, 7, 1, 9, 10, 11, 12, 13, 8,
        25, 29, 17, 27, 28, 15, 16, 22, 18, 19, 20, 26, 23, 24, 21]
};

// Applies one move (like "R" or "R'") to a list of 30 colors
function applyMove(colors, move) {
    const letter = move[0];
    if (!MOVES[letter]) {
        return colors; // unknown move, ignore it
    }

    // Every move has order 3, so R' is the same as two clockwise turns
    let turns = 1;
    if (move.endsWith("'")) {
        turns = 2;
    }

    let result = colors;
    for (let t = 0; t < turns; t++) {
        const next = result.slice();
        for (let i = 0; i < 30; i++) {
            next[MOVES[letter][i]] = result[i];
        }
        result = next;
    }
    return result;
}

// Starts from the solved cube and applies every move of the scramble
function colorsFromScramble(scramble) {
    let colors = solvedColors();
    const moves = scramble.trim().split(/\s+/);
    for (let i = 0; i < moves.length; i++) {
        if (moves[i] !== '') {
            colors = applyMove(colors, moves[i]);
        }
    }
    return colors;
}

// Draws the cube after applying a scramble, e.g. drawScramble("U R' L B")
function drawScramble(scramble) {
    drawSkewbNet(colorsFromScramble(scramble));
}