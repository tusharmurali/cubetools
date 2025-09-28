import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

var letter_pairs = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X"];

scramblers["333"].initialize(null, Math);
// let scramble_str = ""; 
const cornerMapping = {0: 4, 2: 7}; // A -> index 4 in cornersData, C -> index 7
const edgeMapping = {1: 10, 2: 9, 20: 5}; // B -> index 10 in edgesData, C -> index 9, U -> 5
const edgeBufferMap = { "UF": C, "DF": U, "UR": B };
const cornerBufferMap = { "UFR": C, "UBL": A };
const cornersSpeffzToLetterScheme = [12,16,21,19,13,18,7,0,20,23,11,8,22,15,4,9,17,14,2,5,6,10,3,1];
const edgesSpeffzToLetterScheme = [23,21,19,17,16,5,8,1,18,6,10,4,20,2,12,7,22,0,14,3,11,13,15,9];
const edgeBufferToLetterIndex = {
	1: 16, // 1 -> B, which in Speffz is UR
	2: 43, // 2 -> C, which is UF
	20: 6 // 20 -> U, DF
}
const cornerBufferToLetterIndex = {
	0: 12, // 0 -> A, which in Speffz is UBL
	2: 21, // 2 -> C, which is UFR
}

let edge_solution = "", corner_solution = "", valid_scramble = "";
let edge_letters, corner_letters, edgeIndex, cornerIndex;
let memoStartTime = null, memoEndTime = null, mistakes = 0;

// Load saved buffer settings
function loadBuffers() {
  const savedEdge = localStorage.getItem("edge_buffer") || "UF"; // default UF
  const savedCorner = localStorage.getItem("corner_buffer") || "UFR"; // default UFR

  edge_buffer = edgeBufferMap[savedEdge];
  corner_buffer = cornerBufferMap[savedCorner];

  // Set checkboxes based on saved
//   const edgeKey = Object.keys(edgeBufferMap).find(k => edgeBufferMap[k] === savedEdge);
  document.querySelector(`input[name="edge-buffer"][value="${savedEdge}"]`).checked = true;

//   const cornerKey = Object.keys(cornerBufferMap).find(k => cornerBufferMap[k] === savedCorner);
  document.querySelector(`input[name="corner-buffer"][value="${savedCorner}"]`).checked = true;
}

function saveBuffers() {
  const edgeKey = Object.keys(edgeBufferMap).find(k => edgeBufferMap[k] === edge_buffer);
  localStorage.setItem("edge_buffer", edgeKey);
  const cornerKey = Object.keys(cornerBufferMap).find(k => cornerBufferMap[k] === corner_buffer);
  localStorage.setItem("corner_buffer", cornerKey);
}

function setupBufferCheckboxes() {
  document.querySelectorAll('input[name="edge-buffer"]').forEach(cb => {
    cb.addEventListener("change", () => {
      // Uncheck all others
      document.querySelectorAll('input[name="edge-buffer"]').forEach(other => {
        if (other !== cb) other.checked = false;
      });
      edge_buffer = edgeBufferMap[cb.value];
      saveBuffers();
    });
  });

  document.querySelectorAll('input[name="corner-buffer"]').forEach(cb => {
    cb.addEventListener("change", () => {
      document.querySelectorAll('input[name="corner-buffer"]').forEach(other => {
        if (other !== cb) other.checked = false;
      });
      corner_buffer = cornerBufferMap[cb.value];
      saveBuffers();
    });
  });
}

// Init
loadBuffers();
setupBufferCheckboxes();

// Figures out a solution for the cube and displays it
function solveAndDisplay(){
    // Scramble the cube
    var scramble_str = scrambleInput.value;

	if (scramble_str.length === 0) {
		scramble_str = scramblers["333"].getRandomScramble().scramble_string.replace(/  /g, ' ');
	}
    var is_valid_scramble = true;

    var valid_permutations = ["U","U'","U2","L","L'","L2","F","F'","F2","R","R'","R2","B","B'","B2","D","D'","D2","M","M'","M2","S","S'","S2","E","E'","E2","u","u'","u2","l","l'","l2","f","f'","f2","r","r'","r2","b","b'","b2","d","d'","d2","x","x'","x2","y","y'","y2","z","z'","z2"];
    var scramble = scramble_str.split(" ");
    var permutations = [];
    for (var i=0; i<scramble.length; i++ ){
        if ( valid_permutations.indexOf(scramble[i]) != -1 ){
            permutations.push(scramble[i]);
        }
        else if ( scramble[i] != '' ) {
            is_valid_scramble = false;
        }
    }

    // Invalid permutations are removed from the scramble
    valid_scramble = permutations.join(" ");
    if ( !is_valid_scramble ){
		console.log(valid_scramble);
        scrambleInput.value = valid_scramble + " ";
    }
	// console.log(valid_scramble);

    // Cube is scrambled
    scrambleCube(valid_scramble);

    // Solve the cube
    solveCube();
	// console.log(edge_cycles, corner_cycles);

    // Solution to the scramble
    edge_letters = [];
	corner_letters = [];
	edge_solution = "";
	corner_solution = "";
	// console.log(edge_cycles, corner_cycles);
	edge_cycles = edge_cycles.map((value) => {
		if (value >= 0) {
			return letterScheme[24 + edgesSpeffzToLetterScheme[value]].charCodeAt(0) - "a".charCodeAt(0);
		} else {
			return -1 -(letterScheme[24 + edgesSpeffzToLetterScheme[-(value + 1)]].charCodeAt(0) - "a".charCodeAt(0));
		}
	});
	corner_cycles = corner_cycles.map((value) => {
		if (value >= 0) {
			return letterScheme[cornersSpeffzToLetterScheme[value]].charCodeAt(0) - "a".charCodeAt(0);
		} else {
			return -1 -(letterScheme[cornersSpeffzToLetterScheme[-(value + 1)]].charCodeAt(0) - "a".charCodeAt(0));
		}
	});
	// console.log(edge_cycles, corner_cycles);
	// edgesSpeffzToLetterScheme.forEach((val) => console.log(letterScheme[24 + val]));

    // Edges
    if ( edge_cycles.length != 0 || flipped_edges.length != 0 ) {
        for (var i=0; i<edge_cycles.length; i++){
			if (edge_cycles[i] < 0) {
				edge_letters.push("#" + letter_pairs[-(edge_cycles[i] + 1)]);
			} else {
				edge_solution += letter_pairs[edge_cycles[i]]
            	edge_letters.push(letter_pairs[edge_cycles[i]]);
			}
        }
    }

	// Add flipped edges
	for (var i = 0; i < flipped_edges.length; i++) {
		for (var j = 0; j < 12; j++) {
			if (edge_cubies[j][0] == flipped_edges[i]) {
				// To flip an edge, append the cycle given by both stickers of that edge
				edge_letters.push("#" + letter_pairs[sticker_targets[edges_to_full[letter_pairs.indexOf(edge_letters[edge_letters.length - 1])]]]);
				edge_letters.push("f" + letter_pairs[flipped_edges[i]], letter_pairs[edge_cubies[j][1]])
				edge_solution += letter_pairs[flipped_edges[i]] + letter_pairs[edge_cubies[j][1]];
			}
		}
	}
	edge_letters.push("#" + letter_pairs[sticker_targets[edges_to_full[letter_pairs.indexOf(edge_letters[edge_letters.length - 1])]]]);

    // Corners
    if ( corner_cycles.length != 0 || cw_corners.length != 0 || ccw_corners.length != 0 ) {
        for (var i=0; i<corner_cycles.length; i++){
			if (corner_cycles[i] < 0) {
				corner_letters.push("#" + letter_pairs[-(corner_cycles[i] + 1)]);
			} else {
            	corner_letters.push(letter_pairs[corner_cycles[i]]);
				corner_solution += letter_pairs[corner_cycles[i]];
			}
        }
    }

	// Add flipped corners
	for (var i=0; i<cw_corners.length; i++){
		for (var j = 0; j<8; j++) {
			if ( corner_cubies[j][0] == cw_corners[i] ) {
				// To rotate a corner, append the cycle given by two CW stickers of that corner
				corner_letters.push("#" + letter_pairs[sticker_targets[corners_to_full[letter_pairs.indexOf(corner_letters[corner_letters.length - 1])]]]);
				corner_letters.push("t" + letter_pairs[cw_corners[i]], letter_pairs[corner_cubies[j][1]]);
				corner_solution += letter_pairs[cw_corners[i]] + letter_pairs[corner_cubies[j][1]];
			}
		}
	}
	for (var i=0; i<ccw_corners.length; i++){
		for (var j = 0; j<8; j++) {
			if ( corner_cubies[j][0] == ccw_corners[i] ) {
				// To rotate a corner, append the cycle given by two CCW stickers of that corner
				corner_letters.push("#" + letter_pairs[sticker_targets[corners_to_full[letter_pairs.indexOf(corner_letters[corner_letters.length - 1])]]]);
				corner_letters.push("t" + letter_pairs[ccw_corners[i]], letter_pairs[corner_cubies[j][2]]);
				corner_solution += letter_pairs[ccw_corners[i]] + letter_pairs[corner_cubies[j][2]];
			}
		}
	}
	corner_letters.push("#" + letter_pairs[sticker_targets[corners_to_full[letter_pairs.indexOf(corner_letters[corner_letters.length - 1])]]]);

	// console.log(edge_letters, corner_letters, edge_solution, corner_solution);
	// edgeIndex = 0;
	// cornerIndex = 0;

    // Solution is displayed
    // $('#edges').html(edge_pairs);
    // $('#corners').html(corner_pairs);
    // $('#edges-solution').html(edges_solution);
    // $('#corners-solution').html(corners_solution);

    // // Alg.cubing.net url is set
    // $('#algcubing').attr("href", buildAlgCubingUrl(solution, valid_scramble));
}

// Generates a full link to alg.cubing.net for the algorithm
function buildAlgCubingLink(algorithm) {
    const link = document.createElement('a');
    link.href = buildAlgCubingUrl(algorithm);
    link.target = '_blank';
    link.textContent = algorithm;

    const div = document.createElement('div');
    div.appendChild(link);

    return div.outerHTML;
}

// Generates an alg.cubing.net URL for the algorithm with optional setup
function buildAlgCubingUrl(algorithm, setup) {
    let url = "https://alg.cubing.net/?alg=" + encodeURIComponent(algorithm.replace(/<br>/g, "\n"));
    if (setup !== undefined) {
        url += '&setup=' + encodeURIComponent(setup);
    }
    return url;
}

// ThreeJS
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
const loader = new OBJLoader();
const camera = new THREE.PerspectiveCamera(
	25,
	window.innerWidth / window.innerHeight,
	0.1,
	1000,
);
const controls = new OrbitControls(camera, renderer.domElement);
const grayColour = new THREE.Color(0x0b0b0b);

// Adjust this for dimming
const dimOpacity = 0.6;
const pieceMaterial = new THREE.MeshStandardMaterial({
	color: 0x0,
	roughness: 0.7,
});

const letterMaterial = new THREE.MeshStandardMaterial({
	color: 0x000000,
	//roughness: 0.4,
	visible: false,
});
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const pointerDown = new THREE.Vector2();

// DOM
const colourPicker = document.getElementById("colour-picker");
const topIndicator = document.getElementById("top-indicator");
const bottomIndicator = document.getElementById("bottom-indicator");
const resetButtons = document.getElementById("reset-buttons");
const dataContainer = document.getElementById("data-container");
const scrambleControls = document.getElementById("scramble-controls");
const imageControlsContainer = document.getElementById("image-container");
const imageControls = document.getElementById("image-controls");
const creditNote = document.getElementById("credit-note");
const memoControls = document.getElementById("memo-controls");
const edgesInput = document.getElementById("edges-input");
const cornersInput = document.getElementById("corners-input");
const parityCheckbox = document.getElementById("parity-checkbox");
const memoFeedback = document.getElementById("memo-feedback");
const scrambleInput = document.getElementById("scramble-input");
const traceCheckbox = document.getElementById("trace-cycle-checkbox");
const transitionInput = document.getElementById("transition-duration-input");
const memoOnlyCheckbox = document.getElementById("memo-only-checkbox");
const imageInput = document.getElementById("image-input");
const saveImageBtn = document.getElementById("save-image");
const imageList = document.getElementById("image-list");

let cycleBreakDuration = 0; // previously 1000
const transitionDuration = 1000;
let pausedTime = 0;

let memoOnly = false;
if (!localStorage.getItem("memoOnly")) {
	localStorage.setItem("memoOnly", false);
} else {
	memoOnly = localStorage.getItem("memoOnly") === "true";
	memoOnlyCheckbox.checked = memoOnly;
}

memoOnlyCheckbox.addEventListener("change", (e) => {
  memoOnly = e.target.checked;
  localStorage.setItem("memoOnly", memoOnly);
});

let memoImages = [];

function loadImages() {
    imageList.innerHTML = "";
    memoImages.forEach((text, idx) => {
		if (text === -1) {
			const divider = document.createElement("div");
			divider.style.width = "2px";
			divider.style.background = "#aaa";
			divider.style.margin = "0 8px";
			divider.style.alignSelf = "stretch";
			imageList.appendChild(divider);
			return;
		}
        const wrapper = document.createElement("span");
        wrapper.style.display = "inline-block";
        wrapper.style.margin = "4px";
        wrapper.style.padding = "4px 6px";
        wrapper.style.border = "1px solid #ccc";
        wrapper.style.borderRadius = "4px";
        wrapper.style.cursor = "pointer";
        wrapper.style.position = "relative";

        // Actual text (invisible by default, but sets width)
        const textNode = document.createElement("span");
        textNode.textContent = text;
        textNode.style.visibility = "hidden"; // reserve space
		textNode.style.whiteSpace = "pre";
        wrapper.appendChild(textNode);

        // Placeholder sits on top
        const placeholder = document.createElement("span");
        placeholder.textContent = "■";
        placeholder.style.position = "absolute";
        placeholder.style.top = "0";
        placeholder.style.left = "0";
        placeholder.style.right = "0";
        placeholder.style.bottom = "0";
        placeholder.style.display = "flex";
        placeholder.style.alignItems = "center";
        placeholder.style.justifyContent = "center";
        // placeholder.style.background = "white";
        placeholder.style.transition = "opacity 0.2s";
        wrapper.appendChild(placeholder);

        // Hover swaps visibility
        wrapper.onmouseenter = () => {
            placeholder.style.opacity = "0";
            textNode.style.visibility = "visible";
        };
        wrapper.onmouseleave = () => {
            placeholder.style.opacity = "1";
            textNode.style.visibility = "hidden";
        };

        // Click to edit
        wrapper.onclick = () => {
			if (!playing) return;
            const input = document.createElement("input");
            input.type = "text";
            input.value = text;
            input.style.width = "100px";

            input.onblur = () => saveEdit(idx, input.value);
            input.onkeydown = (e) => {
                if (e.key === "Enter") input.blur();
            };

            wrapper.innerHTML = "";
            wrapper.appendChild(input);
            input.focus();
        };

        imageList.appendChild(wrapper);
    });
}



function saveEdit(idx, newValue) {
	if (!newValue.trim()) {
		memoImages.splice(idx, 1)
	} else {
    	memoImages[idx] = newValue.trim();
	}
    loadImages();
}


function saveImage() {
	if (inputBlocked) return;
    const text = imageInput.value.trim();
	const ellapsedTime = new Date().getTime() - startTime;
	addTime(ellapsedTime);
	if (edges) {
		nextEdge();
	} else {
		nextCorner();
	}
    if (!text) return;

    memoImages.push(text);
    imageInput.value = "";
    loadImages();
}

function removeImage(index) {
    memoImages.splice(index, 1);
    loadImages();
}


saveImageBtn.addEventListener("click", saveImage);
loadImages();


document.getElementById("start-trainer").addEventListener("click", startGame);

const urlParams = new URLSearchParams(window.location.search);
const urlScramble = urlParams.get("scramble");
if (urlScramble) {
    scrambleInput.value = urlScramble;
    // scramble_str = urlScramble;
}

scrambleInput.addEventListener("input", (e) => {
	solveAndDisplay();
    const val = e.target.value.trim();
    const url = new URL(window.location);
    url.searchParams.set("scramble", val);
    window.history.replaceState({}, "", url);
});

function loadTrainerSettings() {
	const savedEnabled = localStorage.getItem("trace_cycle_enabled") === "true";
	const savedDuration = parseInt(localStorage.getItem("trace_cycle_duration"), 10);

	traceCheckbox.checked = savedEnabled;
	transitionInput.disabled = !savedEnabled;

	if (savedEnabled && !isNaN(savedDuration)) {
		cycleBreakDuration = savedDuration;
		transitionInput.value = savedDuration;
	} else {
		cycleBreakDuration = 0;
	}
}

function saveTrainerSettings() {
	if (traceCheckbox.checked) {
		const val = parseInt(transitionInput.value, 10) || 0;
		cycleBreakDuration = val;
		localStorage.setItem("trace_cycle_enabled", "true");
		localStorage.setItem("trace_cycle_duration", val);
		transitionInput.disabled = false;
	} else {
		cycleBreakDuration = 0;
		localStorage.setItem("trace_cycle_enabled", "false");
		transitionInput.disabled = true;
	}
}

traceCheckbox.addEventListener("change", saveTrainerSettings);
transitionInput.addEventListener("input", saveTrainerSettings);

loadTrainerSettings();

// Constants
const abc = "abcdefghijklmnopqrstluvwxyz";
const rotateSpeed = 0.15;
const allowTwoSideRecognition = false;
const letters = {};

// Variables
let times = [];
let startTime;

//   CORNERS
//   0 1 2 3 4 5 6 7 8 9
//   h x s w o t u g l p
//
// 1|0 1 2 3 4 5 6 7 8 9
//   v k a e r n b q f d
//
//          |EDGES
// 2|0 1 2 3|4 5 6 7 8 9
//   i c m j|r h n t l f
//
// 3|0 1 2 3 4 5 6 7 8 9
//   j p g x k u o v s w
//
// 4|0 1 2 3 4 5 6 7
//   e d i c m b q a

// prettier-ignore
const schemeIndexes = [
	 8, 28, 20, 42, 23, 30, 11, 34, undefined,
	 9, 31, 22, 44, 15, 26,  4, 36, undefined,
	 5, 27, 17, 46, 14, 24,  2, 38, undefined,
	 0, 25, 13, 40, 18, 29,  7, 32, undefined,
	 1, 33,  6, 35, 10, 37,  3, 39, undefined,
	19, 41, 12, 47, 16, 45, 21, 43, undefined,
];

// prettier-ignore
const cornersData = [
	{ stickers: [24, 27, 36], position: 0 },
	{ stickers: [18, 42, 15], position: 1 },
	{ stickers: [ 0, 38, 33], position: 2 },
	{ stickers: [ 6,  9, 40], position: 3 },
	{ stickers: [22, 47, 29], position: 4 },
	{ stickers: [20, 13, 49], position: 5 },
	{ stickers: [ 2, 31, 45], position: 6 },
	{ stickers: [ 4, 51, 11], position: 7 },
];

// prettier-ignore
const edgesData = [
	{ stickers: [23, 28], position:  8 },
	{ stickers: [14, 19], position:  9 },
	{ stickers: [ 1, 32], position: 10 },
	{ stickers: [ 5, 10], position: 11 },

	{ stickers: [34, 37], position: 12 },
	{ stickers: [ 7, 39], position: 13 },
	{ stickers: [16, 41], position: 14 },
	{ stickers: [25, 43], position: 15 },

	{ stickers: [30, 46], position: 16 },
	{ stickers: [ 3, 52], position: 17 },
	{ stickers: [12, 50], position: 18 },
	{ stickers: [21, 48], position: 19 },
];

/*
const adjacentCornerPoss = [
	[1, 2, 4], // 0 DBL
	[0, 3, 5], // 1 DBR
	[0, 3, 6], // 2 DFL
	[1, 2, 7], // 3 DFR
	[0, 5, 6], // 4 UBL
	[1, 4, 7], // 5 UBR
	[2, 4, 7], // 6 UFL
	[3, 5, 6], // 7 UFR
];
*/

scene.background = grayColour;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// Control
controls.enableZoom = false;
controls.enablePan = false;
controls.dampingFactor = 0.25;
controls.enableDamping = true;

/* Times
 *
 * {
 * a: [3524, 5453, 1535],
 * b: [3524, 5453, 1535],
 * c: [3524, 5453, 1535],
 * }
 */

function resetTime(index) {
	times[index] = [];
	localStorage.setItem("times-" + index, JSON.stringify([]));
}

function resetTimes() {
	for (let i = 0; i < letterScheme.length; i++) {
		resetTime(i);
	}
}

function updateTime(i, mean) {
	dataContainer.children[i].style.width = Math.floor(mean / 10) + "px";
}

function updateTimes() {
	for (let i = 0; i < times.length; i++) {
		//console.log(times[i]);
		const [mean, _] = getMeanAndStandardDeviation(times[i]);
		updateTime(i, mean || 0);
	}
}

function loadTimes() {
	times = [];
	for (let i = 0; i < 48; i++) {
		if (!localStorage.hasOwnProperty("times-" + i)) {
			resetTime(i);
			continue;
		}
		times[i] = JSON.parse(localStorage.getItem("times-" + i));
	}
}

loadTimes();
updateTimes();

function addTime(time) {
	const index = edges ? currentEdge.index : currentCorner.index;
	if (!index) return;
	times[index].push(time);
	//times[index].sort((a, b) => a - b);
	localStorage.setItem("times-" + index, JSON.stringify(times[index]));

	//const flat = times.flat();
	//const mean = flat.reduce((acc, c) => acc + c, 0) / flat.length;
	//console.log(mean/1000);

	const [mean, _] = getMeanAndStandardDeviation(times[index]);
	updateTime(index, mean);
}

function getMeanAndStandardDeviation(array) {
	const n = array.length;
	const mean = array.reduce((a, b) => a + b, 0) / n;
	const stddev = Math.sqrt(
		array.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n,
	);
	return [mean, stddev];
}

let stickerColours;

// Colours
function resetColours() {
	const defaultColours = [
		0x009b48, // Front
		0xe60000, // Right (previously 0xb90000)
		0x0045ad, // Back
		0xff8c00, // Left (previously 0xff5900)
		0xffd500, // Down
		0xffffff, // Up
		0x333333, // Grayed out
	];
	localStorage.setItem("colourScheme", JSON.stringify(defaultColours));
	stickerColours = defaultColours.map((c) => new THREE.Color(c));
}

if (!localStorage.hasOwnProperty("colourScheme")) {
	resetColours();
} else {
	stickerColours = JSON.parse(localStorage.getItem("colourScheme")).map(
		(c) => new THREE.Color(c),
	);
}

let letterScheme;

// Letters
function resetLetters() {
	localStorage.setItem(
		"letterScheme",
		"hxswotuglpvkaernbqfdicmjrhntlfjpgxkuovswedicmbqa",
	);
	letterScheme = localStorage.getItem("letterScheme");
}

if (!localStorage.hasOwnProperty("letterScheme")) {
	resetLetters();
} else {
	letterScheme = localStorage.getItem("letterScheme");
}

function updateLetters() {
	for (const sticker of stickers) {
		if (sticker.index === undefined) {
			continue;
		}
		sticker.parent.children[0].children[sticker.index % 9].geometry =
			letters[letterScheme[schemeIndexes[sticker.index]]];
	}
}

// # store place of every character
// let res = [] index 0 of res is the indexof "a" in lettersceme
// for (let i = 0; i < letter_pairs.length; i++) {
// 	let c = letter_pairs[i].toLowerCase();
// 	let index = letterScheme.slice(0, 24).indexOf(c);
// 	res.push(index);
// }

// res = []
// for (let i = 0; i < letter_pairs.length; i++) {
// 	let c = letter_pairs[i].toLowerCase();
// 	let index = letterScheme.slice(24, 48).indexOf(c);
// 	res.push(index);
// }
// console.log(res.toString());
// whatever character is in letterScheme[place[0]], I want to map 0 to that character

// Material
//const pieceMaterial = new THREE.MeshStandardMaterial({ color: 0x0 });
//const pieceMaterial = new THREE.MeshToonMaterial({ color: 0x0 });

// Ligths
//const ambientLight = new THREE.AmbientLight(0xaaaaaa);
//scene.add(ambientLight);

for (const l of [
	// for toon material
	//{ x: 6, y: 6, z: 6, c: 0xccccff, s: 150 },
	//{ x: -6, y: -6, z: -6, c: 0xffcccc, s: 150 },
	//{ x: 8, y: 8, z: -8, c: 0xaaaaff, s: 200 },
	//{ x: 8, y: -8, z: 8, c: 0xffaaaa, s: 200 },
	//{ x: -8, y: -8, z: 8, c: 0xffaaaa, s: 200 },
	//{ x: -8, y: 8, z: 8, c: 0xaaaaff, s: 200 },

	{ x: 6, y: 6, z: 6, c: 0xddddff, s: 180 },
	{ x: -6, y: -6, z: -6, c: 0xffdddd, s: 180 },
	{ x: 8, y: 8, z: -8, c: 0xffaaaa, s: 240 },
	{ x: 8, y: -8, z: 8, c: 0xaaaaff, s: 240 },
	{ x: -8, y: -8, z: 8, c: 0xffaaaa, s: 240 },
	{ x: -8, y: 8, z: 8, c: 0xaaaaff, s: 240 },
]) {
	const pointLight = new THREE.PointLight(l.c, l.s, 1000);
	scene.add(pointLight);

	pointLight.position.set(l.x, l.y, l.z);

	//const sphereSize = 1;
	//const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
	//scene.add(pointLightHelper);
}

// Cube
let cube = new THREE.Group();
scene.add(cube);

// Sticker array
let stickers = [];

// Loading OBJ files

let basecorner;
let baseedge;
let basecenter;

function loadingFunction(xhr) {
	console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
}
function errorFunction(error) {
	console.log(error);
}

// Load corner
loader.load(
	"corner_stickered.obj",
	(object) => {
		basecorner = object;

		// Load edge
		loader.load(
			"edge_stickered.obj",
			(object) => {
				baseedge = object;

				// Load center
				loader.load(
					"center_stickered.obj",
					(object) => {
						basecenter = object;

						// Font
						const fontLoader = new FontLoader();

						fontLoader.load(
							//"./fonts/optimer_bold.typeface.json",
							"./fonts/columbia_serial_bold.json",
							(font) => {
								// Create cube
								createCube(font);
							},
							loadingFunction,
							errorFunction,
						);
					},
					loadingFunction,
					errorFunction,
				);
			},
			loadingFunction,
			errorFunction,
		);
	},
	loadingFunction,
	errorFunction,
);

function createCube(font) {
	for (const l of abc) {
		const letter = new TextGeometry(l.toUpperCase(), {
			font: font,
			size: 0.8,
			depth: 0.05,
		});
		letter.computeBoundingBox();
		const center = letter.boundingBox.getCenter(new THREE.Vector3());
		const offsetX = center.x;
		const offsetY = center.y;
		letter.translate(-offsetX, -offsetY, 2.8);
		letters[l] = letter;
	}

	// Each side
	const xy = [
		{ x: -1, y: -1 },
		{ x: -1, y: 0 },
		{ x: -1, y: 1 },
		{ x: 0, y: 1 },
		{ x: 1, y: 1 },
		{ x: 1, y: 0 },
		{ x: 1, y: -1 },
		{ x: 0, y: -1 },
	];
	for (let i = 0; i < 6; i++) {
		const side = new THREE.Group();
		cube.add(side);
		const sideLetters = new THREE.Group();
		side.add(sideLetters);

		// Rotate side
		if (i < 4) {
			side.rotateY((Math.PI * i) / 2);
		} else {
			side.rotateX(Math.PI * (i - 3.5));
		}

		//for (let j = 0; j < 4; j++) {
		for (let j = 0; j < 4; j++) {
			const setupSticker = (sticker, skipLetter) => {
				sticker.children[0].material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 1 });
				sticker.solvedColour = stickerColours[i];
				sticker.children[1].material = pieceMaterial;
				side.add(sticker);
				stickers.push(sticker);

				if (skipLetter) {
					return;
				}
			};

			// Letter
			function attachLetter(index) {
				const letter = new THREE.Mesh(
					letters[letterScheme[schemeIndexes[index]]],
					letterMaterial,
				);
				const { x, y } = xy[index % 9];
				letter.translateX(1.867 * x);
				letter.translateY(1.867 * y);
				letter.schemeIndex = schemeIndexes[index];
				sideLetters.add(letter);
			}

			// Corner
			const corner = basecorner.clone();
			setupSticker(corner, false);
			corner.index = i * 9 + j * 2;
			attachLetter(corner.index);
			corner.rotateZ(-(Math.PI * j) / 2);

			// Edge
			const edge = baseedge.clone();
			setupSticker(edge, false);
			edge.index = i * 9 + j * 2 + 1;
			attachLetter(edge.index);
			edge.rotateZ(-(Math.PI * j) / 2);

			// Center
			if (j === 3) {
				const center = basecenter.clone();
				setupSticker(center, true);
			}
		}
	}

	reset();
}

let positionCounter = 20;

let positions = [
	{ x: 0.1, y: 1.2, z: -0.5 }, // DBL
	{ x: 0.1, y: -1.2, z: 0.5 }, // DBR
	{ x: -0.3, y: 0.3, z: 0.05 }, // DFL
	{ x: -0.3, y: -0.3, z: -0.05 }, // DFR

	{ x: 0.6, y: 1.1, z: 0.0 }, // UBL
	{ x: 0.6, y: -1.1, z: -0.0 }, // UBR
	{ x: 0.4, y: 0.3, z: -0.05 }, // UFL
	{ x: 0.4, y: -0.3, z: 0.05 }, // UFR

	{ x: 0.5, y: 1.2, z: -0.2 }, // BL
	{ x: 0.5, y: -1.2, z: 0.2 }, // BR
	{ x: 0.2, y: 0.4, z: -0.05 }, // FL
	{ x: 0.2, y: -0.4, z: 0.05 }, // FR

	{ x: -0.2, y: 0.4, z: -0.1 }, // DL
	{ x: -0.3, y: 0.0, z: 0.0 }, // DF
	{ x: -0.2, y: -0.4, z: 0.1 }, // DR
	{ x: -0.35, y: 1.2, z: -0.1 }, // DB

	{ x: 0.4, y: 0.4, z: -0.1 }, // UL
	{ x: 0.4, y: 0.0, z: 0.0 }, // UF
	{ x: 0.4, y: -0.4, z: 0.1 }, // UR
	{ x: 1.2, y: 0.2, z: -0.3 }, // UB
].map((r) => {
	const qcube = new THREE.Quaternion();
	const qcamera = new THREE.Quaternion();
	qcube.setFromEuler(
		new THREE.Euler(
			(r.x * Math.PI) / 4,
			(r.y * Math.PI) / 4,
			(r.z * Math.PI) / 4,
		),
	);
	qcamera.setFromEuler(
		new THREE.Euler(
			(-r.x * Math.PI) / 4,
			(-r.y * Math.PI) / 4,
			(-r.z * Math.PI) / 4,
		),
	);
	return { cube: qcube, camera: qcamera };
});

positions.push(
	(() => {
		const qcube = new THREE.Quaternion();
		const qcamera = new THREE.Quaternion();
		qcube.setFromEuler(new THREE.Euler(0, 0, 0));
		qcamera.setFromEuler(new THREE.Euler((-0.3 * Math.PI) / 2, 0, 0));
		return { cube: qcube, camera: qcamera };
	})(),
);

// function randomRange(min, max) {
// 	return min + Math.floor(Math.random() * max);
// }

let currentCorner;
let currentEdge;
let startLetter;

function setPiecesGray(exclude = (i) => i % 9 === 8, alpha = 1.0) {
	for (let i = 0; i < stickers.length; i++) {
		if (exclude(i)) {
			continue;
		}
		stickers[i].children[0].material.opacity = 1;
		stickers[i].targetColour = new THREE.Color(stickers[i].solvedColour).lerp(
			stickerColours[6],
			alpha,
		);
	}
}

function setPiecesSolved() {
	for (const sticker of stickers) {
		sticker.targetColour = sticker.solvedColour;
		sticker.children[0].material.opacity = 1;
	}
}

// function setModePreview() {
// 	setPiecesSolved();
// 	for (const pieceData of edges ? cornersData : edgesData) {
// 		for (const i of pieceData.stickers) {
// 			stickers[i].targetColour = stickerColours[6];
// 		}
// 	}
// }

let resetTimeout = setTimeout(() => {
	if (!playing && !orbit) {
		controls.autoRotate = true;
	}
}, 500);

function reset() {
	orbit = false;
	edges = false;
	mistakes = 0;
	pausedTime = 0;
	memoImages = [];
	loadImages();
	letterMaterial.visible = false;
	cube.visible = true;

	if (resetTimeout) {
		clearTimeout(resetTimeout);
	}
	resetTimeout = setTimeout(() => {
		if (!playing && !orbit) {
			controls.autoRotate = true;
		}
	}, 500);

	positionCounter = 20;
	//controls.autoRotate = true;

	controls.enableRotate = true;
	playing = false;
	setPiecesSolved();

	startLetter = letterScheme[edges ? edgeBufferToLetterIndex[edge_buffer] : cornerBufferToLetterIndex[corner_buffer]];
// console.log(corner_buffer)
	// startLetter = edges ? letterScheme[43] : letterScheme[21]; IF UF/UFR


	topIndicator.style.top = "0";
	topIndicator.textContent = `Press ${startLetter.toUpperCase()} to start`;
	resetButtons.hidden = true;
	bottomIndicator.textContent = "Press SPACE to change settings";
	scrambleControls.style.display = "flex";
	imageControls.style.display = "flex"
	imageControlsContainer.style.display = "none";
	memoControls.style.display = "none";
	memoFeedback.style.display = "none";
	creditNote.innerHTML = `Original creator: <a href="https://github.com/timeopochin/cubetools" target="_blank">timeopochin</a>`;
	creditNote.style.display = "block";

	currentCorner = { ...cornersData[cornerMapping[corner_buffer]] };
	currentCorner.twist = 0;
	// currentCorner.answer = letterScheme[21].toUpperCase();
	currentCorner.buffer = true;

	// currentEdge = { ...edgesData[10] };
	currentEdge = { ...edgesData[edgeMapping[edge_buffer]] };
	currentEdge.flip = true;
	// currentEdge.answer = letterScheme[43].toUpperCase();
	currentEdge.buffer = true;
	// console.log(corner_buffer, edge_buffer, cornerMapping[corner_buffer], edgeMapping[edge_buffer])

	cornerIndex = 0;
	edgeIndex = 0;
}

function getNextCorner() {
	if (cornerIndex >= corner_letters.length) return;
	let letter = corner_letters[cornerIndex++];
	let twistStart = letter.startsWith("t"), cycleBreak = letter.startsWith("#");
	if (twistStart || cycleBreak) {
		letter = letter.charAt(1);
	}
	const index = letterScheme.indexOf(letter.toLowerCase());
	const twist = (index - currentCorner.twist + 3) % 3;

	return { ...cornersData[Math.floor(index / 3)], twist, twistStart, cycleBreak };
}

function getNextEdge() {
	if (edgeIndex >= edge_letters.length) return;
	if (edgeIndex < 0) {
		edgeIndex++;
		return;
	}
	let letter = edge_letters[edgeIndex++];
	let flipStart = letter.startsWith("f"), cycleBreak = letter.startsWith("#");
	if (flipStart || cycleBreak) {
		letter = letter.charAt(1);
	}
	const index = letterScheme.slice(24, 48).indexOf(letter.toLowerCase());
	const flip = index % 2 ^ currentEdge.flip;

	return { ...edgesData[Math.floor(index / 2)], flip, flipStart, cycleBreak };
}

let inputBlocked = false;

function nextCorner() {
	topIndicator.textContent = 
		(currentCorner.twistStart && !memoOnly)
			? currentCorner.answer.toUpperCase() + " (Twist)"
			: (currentCorner.buffer 
				? "Buffer"
				: currentCorner.answer.toUpperCase());

	if (memoOnly) {
		if (cornerIndex === corner_letters.length - 1)
			topIndicator.textContent += " (Final)"
		else if (cornerIndex >= corner_letters.length) {
			startEdges();
			return;
		}
		if (currentCorner.cycleBreak && !currentCorner.twistStart) {
			inputBlocked = true;
			pausedTime += cycleBreakDuration;
			setTimeout(() => {
				inputBlocked = false;
				nextCorner();
			}, cycleBreakDuration);
		}
	}
	console.log(memoImages);
	
	setPiecesGray();

	const corner = getNextCorner();
	if (!corner) {
		topIndicator.textContent = "Finished";

		// Auto-start edges
        startEdges();
		return;
	} else if (corner.cycleBreak && !memoOnly) {
		// console.log(scrambleInput.value, edge_cycles, edge_letters, corner);
		topIndicator.textContent = (currentCorner.buffer ? "Buffer" : currentCorner.answer.toUpperCase())
			+ (cornerIndex < corner_letters.length - 1 
				? " (Break)" 
				: " (Finished)");
		inputBlocked = true;
		pausedTime += cycleBreakDuration;
		setTimeout(() => {
			inputBlocked = false;
			nextCorner();
			nextCorner();
		}, cycleBreakDuration);
	}
	// const answer = corner_letters[cornerIndex++].toLowerCase();
	// const index = letterScheme.indexOf(answer);
	// const twist = index % 3;
	// const corner = {...cornersData[Math.floor(index / 3)], twist};
	// console.log(corner);

	for (let i = 0; i < 3; i++) {
		// let targetColour = stickers[corner.stickers[(i + corner.twist) % 3]].solvedColour;
		// highlight one sticker
		if ((i - currentCorner.twist + 3) % 3 !== 1) {
			// targetColour = targetColour.clone()
			// targetColour.lerp(black, 0.07);
			// targetColour.offsetHSL(0, -0.07, -0.07);
			
			// targetColour.transparent = true;
			// targetColour.opacity = 0.5;
			// stickers[currentCorner.stickers[i]].children[0].material.transparent = true;
			stickers[currentCorner.stickers[i]].children[0].material.opacity = dimOpacity;

			// targetColour.lerp(new THREE.Color(0x000000), 0.2);
		}
		stickers[currentCorner.stickers[i]].targetColour = 
			stickers[corner.stickers[(i + corner.twist) % 3]].solvedColour;
		
		// if ((i - currentCorner.twist + 3) % 3 === 1) {
			// addOutline(stickers[currentCorner.stickers[i]].children[0]);
			// console.log(stickers[currentCorner.stickers[i]].children[0])
			// stickers[currentCorner.stickers[i]].children[0].material.emissive.set(0xffffff); // Yellow highlight
			// stickers[currentCorner.stickers[i]].children[0].material.emissiveIntensity = 0.1;
		// }
			// .clone().lerp(new THREE.Color(0x000000), i - currentCorner.twist % 3 == 1 ? 0.9 : 0);
	}
	// highlight sticker on current corner
	// console.log(stickers[currentCorner.stickers[(currentCorner.twist + 1) % 3]].targetColour);
	// console.log(stickers[currentCorner.stickers[(currentCorner.twist + 1) % 3]].children[0].material)
	// const interp = stickers[currentCorner.stickers[(currentCorner.twist + 1) % 3]].targetColour.clone().offsetHSL(0, 0.3, 0.5);
	// stickers[currentCorner.stickers[(currentCorner.twist + 1) % 3]].targetColour = stickers[currentCorner.stickers[(currentCorner.twist + 1) % 3]].targetColour.clone().lerp(interp, 0.2);
	// .children[0].material.emissive.set(0x00ff00);
	//  = stickers[currentCorner.stickers[(currentCorner.twist + 1) % 3]].targetColour.clone().lerp(new THREE.Color(0xffffff), 0.1);
	// const base = stickers[currentCorner.stickers[(currentCorner.twist + 1) % 3]].targetColour
	// stickers[currentCorner.stickers[(currentCorner.twist + 1) % 3]].targetColour = new THREE.Color(0x000000).lerp(base, 0.9);
	// setPiecesGray((i) => i !== currentCorner.stickers[(currentCorner.twist) % 3], 0.5);
	// stickers[currentCorner.stickers[(currentCorner.twist + 1) % 3]].targetColour

	let newPos = currentCorner.position;
	if (allowTwoSideRecognition && [0, 1, 4, 5].includes(newPos)) {
		newPos += 2;
	}

	positionCounter = newPos;

	
	const relativeTwist = (currentCorner.twist + corner.twist) % 3;
	const index = corner.position * 3 + relativeTwist;
	const answer = letterScheme[index];
	// console.log(index, Math.floor(index / 3), corner.position, index % 3, relativeTwist, answer, letterScheme.indexOf(answer));

	currentCorner = { ...corner };
	currentCorner.twist = relativeTwist;
	currentCorner.answer = answer;
	currentCorner.index = index;

	// console.log(currentCorner);

	startTime = new Date().getTime();
	// console.log(answer);
}

function nextEdge() {
	topIndicator.textContent = 
		(currentEdge.flipStart && !memoOnly)
			? currentEdge.answer.toUpperCase() + " (Flip)"
			: (currentEdge.buffer 
				? "Buffer"
				: currentEdge.answer.toUpperCase());

	if (memoOnly) {
		if (edgeIndex === edge_letters.length - 1)
			topIndicator.textContent += " (Final)"
		else if (edgeIndex >= edge_letters.length) {
			promptUserMemo();
			return;
		}
		if (currentEdge.cycleBreak && !currentEdge.flipStart || edgeIndex === 0) {
			inputBlocked = true;
			pausedTime += cycleBreakDuration;
			setTimeout(() => {
				inputBlocked = false;
				nextEdge();
			}, cycleBreakDuration);
		}
	}

	setPiecesGray();

	let edge = getNextEdge();
	if (!edge) {
		if (edgeIndex !== 0) {
			topIndicator.textContent = "Finished";
			memoEndTime = Date.now();
			promptUserMemo();
		}
		return;
	} else if (edge && edge.cycleBreak && !memoOnly) {
		// topIndicator.textContent = edgeIndex < edge_letters.length - 1 ? "Break" : "Finished";
		topIndicator.textContent = (currentEdge.buffer ? "Buffer" : currentEdge.answer.toUpperCase())
			+ (edgeIndex < edge_letters.length - 1
				? " (Break)" 
				: " (Finished)");

		inputBlocked = true;
		pausedTime += cycleBreakDuration;
		setTimeout(() => {
			inputBlocked = false;
			nextEdge();
			nextEdge();
		}, cycleBreakDuration);
	}

	for (let i = 0; i < 2; i++) {
		// let targetColour = stickers[edge.stickers[(i + edge.flip) % 2]].solvedColour;
		if (i !== +currentEdge.flip) {
			// targetColour = targetColour.clone()
			// targetColour.lerp(black, 0.07);
			// targetColour.offsetHSL(0, -0.07, -0.07);
			stickers[currentEdge.stickers[i]].children[0].material.opacity = dimOpacity;
		}
		stickers[currentEdge.stickers[i]].targetColour = 
			stickers[edge.stickers[(i + edge.flip) % 2]].solvedColour;
	}
	
	positionCounter = currentEdge.position;

	const relativeFlip = currentEdge.flip != edge.flip;
	const index = 24 + (edge.position - 8) * 2 + relativeFlip;
	const answer = letterScheme[index];
	// console.log(edge, index, letterScheme[index]);

	currentEdge = { ...edge };
	currentEdge.flip = relativeFlip;
	currentEdge.answer = answer;
	currentEdge.index = index;

	startTime = new Date().getTime();
	//console.log(answer);
}

function startEdges() {
    edges = true;
    edgeIndex = -1;
    topIndicator.textContent = "Get ready for edges...";
	memoImages.push(-1);
	pausedTime += transitionDuration;
	imageList.appendChild(document.createElement("br"));
    setTimeout(() => {
		nextEdge();
		if (memoOnly) nextEdge();
	}, transitionDuration);
}

function chunkPairs(str) {
  return str.match(/.{1,2}/g) || [];
}

function saveMemoSession(duration, mistakes, success) {
    const sessions = JSON.parse(localStorage.getItem("memo-sessions") || "[]");
    sessions.push({ duration, mistakes, success, date: new Date().toISOString() });
    localStorage.setItem("memo-sessions", JSON.stringify(sessions));
}

function getMemoStats() {
    const sessions = JSON.parse(localStorage.getItem("memo-sessions") || "[]");
    if (!sessions.length) return { memoAverage: 0, tracingAverage: 0, mistakesAvg: 0, count: 0 };

	let totalMemoTime = 0, totalTracingTime = 0, successes = 0, totalMistakes = 0;
	sessions.forEach((s) => {
		if (s.success) {
			totalMemoTime += s.duration
			successes += 1
		} else {
			totalTracingTime += s.duration
		}
		totalMistakes += s.mistakes;
	});
	
    return {
        memoAverage: (totalMemoTime / successes).toFixed(2),
        tracingAverage: (totalTracingTime / (sessions.length - successes)).toFixed(2),
        mistakesAvg: (totalMistakes / sessions.length).toFixed(2),
        count: sessions.length,
    };
}

function promptUserMemo() {
    playing = false;
    inputBlocked = false;
    topIndicator.textContent = "";

    memoControls.style.display = "flex";
	// imageControlsContainer.style.display = "none";
	imageControls.style.display = "none";
	creditNote.style.display = "none";
    // memoFeedback.style.display = "block";
    edgesInput.value = "";
    cornersInput.value = "";
    parityCheckbox.checked = false;
    memoFeedback.textContent = "";

    // Hook up submit button
    const submitBtn = document.getElementById("submit-memo");
    submitBtn.onclick = () => {
		const userEdges = edgesInput.value.replace(/\s+/g, "").toUpperCase();
		const userCorners = cornersInput.value.replace(/\s+/g, "").toUpperCase();
		const userParity = parityCheckbox.checked;

		const parityCorrect = (edge_solution.length % 2 === 1) === userParity;
		const edgesCorrect = userEdges === edge_solution;
		const cornersCorrect = userCorners === corner_solution;
		const success = edgesCorrect && cornersCorrect && parityCorrect;

		memoControls.style.display = "none";
		memoFeedback.style.display = "block";
		memoFeedback.className = "";

		if (success) {
			memoFeedback.classList.add("success");
			memoFeedback.innerHTML = 
				`Scramble: ${valid_scramble}<br>` +
				"All correct!";
		} else {
			const edgePairs = chunkPairs(edge_solution).join(" ");
			const cornerPairs = chunkPairs(corner_solution).join(" ");
			memoFeedback.classList.add("error");
			memoFeedback.innerHTML =
				`Scramble: ${valid_scramble}<br>` +
				`Edges: ${edgePairs}<br>` +
				`Corners: ${cornerPairs}<br>` +
				`Parity: ${edge_solution.length % 2 === 1 ? "Yes" : "No"}`;
		}

		const memoDuration = ((memoEndTime - memoStartTime - pausedTime) / 1000).toFixed(2);
		saveMemoSession(Number(memoDuration), mistakes, success);
		const memoTimeIndicator = document.createElement("span");
		memoTimeIndicator.classList.add("memo-time");
		memoTimeIndicator.style.marginTop = "8px";
		memoTimeIndicator.textContent = (success ? "Memo" : "Tracing") + ` Time: ${memoDuration}s`;
		memoFeedback.appendChild(memoTimeIndicator);

		const type = !memoOnly ? "Tracing" : "Memo";
		const mistakesIndicator = document.createElement("span");
		mistakesIndicator.classList.add("memo-time"); 
		mistakesIndicator.textContent = `${type} Mistakes: ${mistakes}`;
		memoFeedback.appendChild(mistakesIndicator);

		const stats = getMemoStats();

		const memoAverageTimeIndicator = document.createElement("span");
		memoAverageTimeIndicator.classList.add("memo-time");
		memoAverageTimeIndicator.textContent = `Average Success Time: ${stats.memoAverage}s`;
		memoFeedback.appendChild(memoAverageTimeIndicator);

		const tracingAverageTimeIndicator = document.createElement("span");
		tracingAverageTimeIndicator.classList.add("memo-time");
		tracingAverageTimeIndicator.textContent = `Average ${type} Time: ${stats.tracingAverage}s`;
		memoFeedback.appendChild(tracingAverageTimeIndicator);

		const averageMistakesIndicator = document.createElement("span");
		averageMistakesIndicator.classList.add("memo-time");
		averageMistakesIndicator.textContent = `Average ${type} Mistakes: ${stats.mistakesAvg}`;
		memoFeedback.appendChild(averageMistakesIndicator);
	};
}


let playing = false;
let edges = false;
let timeouts = [];

function startGame() {
	solveAndDisplay();

	bottomIndicator.textContent = "Press SPACE to exit";
	if (memoOnly) {
		imageControlsContainer.style.display = "flex";
		cube.visible = false;
	} 
	creditNote.style.display = "none";
	scrambleControls.style.display = "none";
	playing = true;
	controls.enableRotate = false;
	controls.autoRotate = false;
	positionCounter = 20;
	setPiecesGray();

	memoStartTime = Date.now();
    memoEndTime = null;
	topIndicator.textContent = "Get ready for corners...";
	if (memoOnly) topIndicator.style.top = "30%";
	pausedTime += transitionDuration;
	timeouts.push(
		setTimeout(() => {
			if (edges) {
				nextEdge();
			} else {
				nextCorner();
			}
			if (memoOnly) {
				if (edges) {
					nextEdge();
				} else {
					nextCorner();
				}
			}
		}, transitionDuration),
	);
}

document.body.addEventListener("keyup", (e) => {
	const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) {
        // If we're typing into an input/textarea, ignore trainer shortcuts
        return;
    }
	if (inputBlocked) {
		return;
	}

	if (playing) {
		if (e.key === " ") {

			for (const timeout of timeouts) {
				clearTimeout(timeout);
			}
			timeouts = [];
			//positionCounter = 20;
			reset();
		} else if (
			(e.key === currentCorner.answer && !edges) ||
			(e.key === currentEdge.answer && edges)
		) {
			const ellapsedTime = new Date().getTime() - startTime;
			addTime(ellapsedTime);
			if (edges) {
				nextEdge();
			} else {
				nextCorner();
			}
		} else if (abc.includes(e.key) && !memoOnly) {
			mistakes++;
			scene.background = new THREE.Color(0x862121);
			setTimeout(() => (scene.background = grayColour), 200);
		}
		return;
	}

	// Input
	if (selectedSticker) {
		if (abc.includes(e.key) && selectedSticker.index % 9 !== 8) {
			selectedSticker.parent.parent.children[0].children[
				selectedSticker.index % 9
			].geometry = letters[e.key];

			const index = schemeIndexes[selectedSticker.index];
			letterScheme =
				letterScheme.slice(0, index) + e.key + letterScheme.slice(index + 1);

			localStorage.setItem("letterScheme", letterScheme);
			selectedSticker = null;
		} else {
			selectedSticker = null;
		}
		colourPicker.style.display = "none";
		setPiecesSolved();

		bottomIndicator.textContent = "Press SPACE to go back";
		return;
	}

	if (orbit) {
		if (e.key === " ") {
			inEditor = false;
			reset();
		}
		return;
	}

	switch (e.key) {
		case startLetter:
			startGame();
			break;
		case " ":
			reset();
			if (!playing && !inEditor) {
				orbit = true;
				letterMaterial.visible = true;
				controls.autoRotate = false;
				// setPiecesSolved();
				topIndicator.textContent = "Scheme Editor";
				resetButtons.hidden = false;
				bottomIndicator.textContent = "Press SPACE to go back";
				scrambleControls.style.display = "none";
				inEditor = true;
			}
			break;
	}
});

let orbit = false;
let inEditor = false;
let mouseDown = false;

// function openEditor() {
// 	if (!playing && !inEditor) {
// 		orbit = true;
// 		letterMaterial.visible = true;
// 		controls.autoRotate = false;
// 		setPiecesSolved();
// 		topIndicator.textContent = "Scheme editor";
// 		resetButtons.hidden = false;
// 		bottomIndicator.textContent = "Press SPACE to go back";
// 		inEditor = true;
// 	}
// }

renderer.domElement.addEventListener("mousedown", (e) => {
	mouseDown = true;
	pointerDown.x = e.clientX;
	pointerDown.y = e.clientY;
	// openEditor();
});

function updateColours() {
	for (let i = 0; i < stickers.length; i++) {
		stickers[i].solvedColour = stickerColours[Math.floor(i / 9)];
	}
	// if (orbit) {
	setPiecesSolved();
		// return;
	// }
	// setModePreview();
}

colourPicker.addEventListener("change", (e) => {
	if (!selectedSticker) {
		return;
	}
	const newColour = Number("0x" + e.target.value.slice(1));
	const face = Math.floor(selectedSticker.index / 9);
	stickerColours[face] = new THREE.Color(newColour);

	let colours = JSON.parse(localStorage.getItem("colourScheme"));
	colours[face] = newColour;
	localStorage.setItem("colourScheme", JSON.stringify(colours));

	updateColours();
	colourPicker.style.display = "none";
	// setPiecesSolved();
});

let selectedSticker = null;

renderer.domElement.addEventListener("mouseup", (e) => {
	mouseDown = false;
	if (
		playing || !inEditor ||
		Math.abs(pointerDown.x - e.clientX) > 10 ||
		Math.abs(pointerDown.y - e.clientY) > 10
	) {
		return;
	}

	// Rayacst
	selectedSticker = getMouseSticker();

	// No sticker
	if (!selectedSticker) {
		bottomIndicator.textContent = "Press SPACE to go back";
		colourPicker.style.display = "none";
		setPiecesSolved();
		return;
	}

	if (selectedSticker.index % 9 === 8) {
		// // Center sticker
		// colourPicker.value =
		// 	"#" + stickers[selectedSticker.index].solvedColour.getHexString();
		// colourPicker.click();

		// Center sticker clicked
		colourPicker.value = "#" + stickers[selectedSticker.index].solvedColour.getHexString();
		colourPicker.style.display = "block";
		colourPicker.click();
	} else {
		// Letter sticker
		bottomIndicator.textContent = "Press A-Z to change";
	}

	setPiecesGray((i) => i === selectedSticker.index, 0.9);
	selectedSticker.parent.targetColour = selectedSticker.parent.solvedColour;
});

document
	.getElementById("reset-colour-scheme")
	.addEventListener("keyup", (e) => e.preventDefault());
document.getElementById("reset-colour-scheme").addEventListener("click", () => {
	if (
		window.confirm("Are you sure you want to reset to the default colours?")
	) {
		resetColours();
		updateColours();
	}
});

document
	.getElementById("reset-letter-scheme")
	.addEventListener("keyup", (e) => e.preventDefault());
document.getElementById("reset-letter-scheme").addEventListener("click", () => {
	if (
		window.confirm("Are you sure you want to reset to the default lettering?")
	) {
		resetLetters();
		updateLetters();
	}
});

document.getElementById("reset-times").addEventListener("click", () => {
	if (window.confirm("Are you sure you want to reset the data?")) {
		resetTimes();
	}
});

window.addEventListener("pointermove", (event) => {
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function getMouseSticker() {
	raycaster.setFromCamera(pointer, camera);
	const intersects = raycaster.intersectObjects(
		stickers.map((sticker, index) => {
			let stickerWithIndex = sticker.children[0];
			stickerWithIndex.index = index;
			return stickerWithIndex;
		}),
	);
	return intersects.length ? intersects[0].object : undefined;
}

function slerpCube() {
	cube.quaternion.slerp(positions[positionCounter].cube, rotateSpeed);
}

function slerpCamera() {
	camera.position.set(0, 0, 0);
	camera.quaternion.slerp(positions[positionCounter].camera, rotateSpeed);
	camera.translateZ(30);
}

function animate() {
	requestAnimationFrame(animate);
	const colorSpeed = 0.15;

	if (!orbit) {
		if (playing || !controls.autoRotate) {
			slerpCamera();
			slerpCube();
		} else {
			slerpCube();
			camera.position.set(0, 0, 0);
			camera.translateZ(30);
		}
	} else {
		/* gray on hover
		const object = getMouseSticker();
		const index = object ? object.index : null;
		for (let i = 0; i < stickers.length; i++) {
			if (!selectedSticker) {
				if (i === index && !mouseDown) {
					stickers[i].targetColour = stickerColours[6];
				} else {
					stickers[i].targetColour = stickers[i].solvedColour;
				}
			}
		}
		*/
	}

	for (const sticker of stickers) {
		sticker.children[0].material.color.lerp(sticker.targetColour, colorSpeed);
		//sticker.children[0].material.emissive.lerp(
		//new THREE.Color(sticker.targetColour).lerp(new THREE.Color(0x0), 0.4),
		//colorSpeed,
		//);
	}

	controls.update();
	renderer.render(scene, camera);
}

if (WebGL.isWebGLAvailable()) {
	animate();
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById("container").appendChild(warning);
}
