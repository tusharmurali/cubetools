// Vars
var cube_canvas; // Canvas object
var full_cube = new Array(54); // Position of all 54 stickers in the cube
var corners   = new Array(24); // Position of all 24 corner stickers in the cube
var edges     = new Array(24); // Position of all 24 edge stickers in the cube
var centers   = new Array(6);  // Position of all 6 edge stickers in the cube

// Constants
var colors = new Array(6);
colors[0] = '#FFFFFF';
colors[1] = '#FF9900';
colors[2] = '#00FF00';
colors[3] = '#FF0000';
colors[4] = '#0000FF';
colors[5] = '#FFFF00';

var CORNERS = 0;
var EDGES   = 1;
var CENTERS = 2;
var BH      = 0;
var M2      = 1;
var OP      = 2;
var pseudo_swap = false;

// Speffz
var A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9, K=10, L=11, M=12, N=13, O=14, P=15, Q=16, R=17, S=18, T=19, U=20, V=21, W=22, X=23, Z=-1;

var corners_to_full = [0, 6, 8, 2, 9,  15, 17, 11, 18, 24, 26, 20, 27, 33, 35, 29, 36, 42, 44, 38, 45, 51, 53, 47]; // Mapping of corners array to full cube
var edges_to_full   = [3, 7, 5, 1, 12, 16, 14, 10, 21, 25, 23, 19, 30, 34, 32, 28, 39, 43, 41, 37, 48, 52, 50, 46]; // Mapping of edges array to full cube
var centers_to_full = [4, 13, 22, 31, 40, 49]; // Mapping of centers array to full cube

// Edge and corner cubies
// Sticker in position 0,0 of cubie arrays represents the buffer
var corner_buffer = C; // UF
var edge_buffer = C; // UFR
// var corner_cubies  = [[A,E,R],[B,Q,N],[C,M,J],[D,I,F],[U,G,L],[V,K,P],[W,O,T],[X,S,H]];
// var corner_cubies  = [[A,E,R],[B,Q,N],[C,M,J],[D,I,F],[U,G,L],[V,K,P],[W,O,T],[X,S,H]];
var corner_cubies  = [[A,E,R],[B,Q,N],[C,M,J],[D,I,F],[U,G,L],[V,K,P],[W,O,T],[X,S,H]];
var corner_buffer_locs = {0: 0, 2: 2};
var solved_corners = [true, true, true, true, true, true, true, true];
var corner_cycles  = [];
var cw_corners     = [];
var ccw_corners    = [];
// var edge_cubies    = [[U,K],[A,Q],[B,M],[C,I],[D,E],[R,H],[T,N],[L,F],[J,P],[V,O],[W,S],[X,G]];
// var edge_cubies    = [[U,K],[A,Q],[B,M],[C,I],[D,E],[R,H],[T,N],[L,F],[J,P],[V,O],[W,S],[X,G]];
var edge_cubies    = [[A,Q],[B,M],[C,I],[D,E],[J,P],[L,F],[R,H],[T,N],[U,K],[V,O],[W,S],[X,G]];
var edge_buffer_locs = {1: 1, 2: 2, 20: 8};
var solved_edges   = [true, true, true, true, true, true, true, true, true, true, true, true];
var edge_cycles    = [];
var flipped_edges  = [];
var rotations      = [];
var sticker_targets = new Array(54); // maps each full_cube position to solved letter


// Definitions of available permutations
var permutations = {
    // Outer layers
    "U"  : {0:[B,C,D,A,Q,R,Z,Z,E,F,Z,Z,I,J,Z,Z,M,N,Z,Z,Z,Z,Z,Z], 1:[B,C,D,A,Q,Z,Z,Z,E,Z,Z,Z,I,Z,Z,Z,M,Z,Z,Z,Z,Z,Z,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "U'" : {0:[D,A,B,C,I,J,Z,Z,M,N,Z,Z,Q,R,Z,Z,E,F,Z,Z,Z,Z,Z,Z], 1:[D,A,B,C,I,Z,Z,Z,M,Z,Z,Z,Q,Z,Z,Z,E,Z,Z,Z,Z,Z,Z,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "U2" : {0:[C,D,A,B,M,N,Z,Z,Q,R,Z,Z,E,F,Z,Z,I,J,Z,Z,Z,Z,Z,Z], 1:[C,D,A,B,M,Z,Z,Z,Q,Z,Z,Z,E,Z,Z,Z,I,Z,Z,Z,Z,Z,Z,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "F"  : {0:[Z,Z,P,M,Z,C,D,Z,J,K,L,I,V,Z,Z,U,Z,Z,Z,Z,F,G,Z,Z], 1:[Z,Z,P,Z,Z,C,Z,Z,J,K,L,I,Z,Z,Z,U,Z,Z,Z,Z,F,Z,Z,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "F'" : {0:[Z,Z,F,G,Z,U,V,Z,L,I,J,K,D,Z,Z,C,Z,Z,Z,Z,P,M,Z,Z], 1:[Z,Z,F,Z,Z,U,Z,Z,L,I,J,K,Z,Z,Z,C,Z,Z,Z,Z,P,Z,Z,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "F2" : {0:[Z,Z,U,V,Z,P,M,Z,K,L,I,J,G,Z,Z,F,Z,Z,Z,Z,C,D,Z,Z], 1:[Z,Z,U,Z,Z,P,Z,Z,K,L,I,J,Z,Z,Z,F,Z,Z,Z,Z,C,Z,Z,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "R"  : {0:[Z,T,Q,Z,Z,Z,Z,Z,Z,B,C,Z,N,O,P,M,W,Z,Z,V,Z,J,K,Z], 1:[Z,T,Z,Z,Z,Z,Z,Z,Z,B,Z,Z,N,O,P,M,Z,Z,Z,V,Z,J,Z,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "R'" : {0:[Z,J,K,Z,Z,Z,Z,Z,Z,V,W,Z,P,M,N,O,C,Z,Z,B,Z,T,Q,Z], 1:[Z,J,Z,Z,Z,Z,Z,Z,Z,V,Z,Z,P,M,N,O,Z,Z,Z,B,Z,T,Z,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "R2" : {0:[Z,V,W,Z,Z,Z,Z,Z,Z,T,Q,Z,O,P,M,N,K,Z,Z,J,Z,B,C,Z], 1:[Z,V,Z,Z,Z,Z,Z,Z,Z,T,Z,Z,O,P,M,N,Z,Z,Z,J,Z,B,Z,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "L"  : {0:[I,Z,Z,L,F,G,H,E,U,Z,Z,X,Z,Z,Z,Z,Z,D,A,Z,S,Z,Z,R], 1:[Z,Z,Z,L,F,G,H,E,Z,Z,Z,X,Z,Z,Z,Z,Z,D,Z,Z,Z,Z,Z,R], 2:[Z,Z,Z,Z,Z,Z]},
    "L'" : {0:[S,Z,Z,R,H,E,F,G,A,Z,Z,D,Z,Z,Z,Z,Z,X,U,Z,I,Z,Z,L], 1:[Z,Z,Z,R,H,E,F,G,Z,Z,Z,D,Z,Z,Z,Z,Z,X,Z,Z,Z,Z,Z,L], 2:[Z,Z,Z,Z,Z,Z]},
    "L2" : {0:[U,Z,Z,X,G,H,E,F,S,Z,Z,R,Z,Z,Z,Z,Z,L,I,Z,A,Z,Z,D], 1:[Z,Z,Z,X,G,H,E,F,Z,Z,Z,R,Z,Z,Z,Z,Z,L,Z,Z,Z,Z,Z,D], 2:[Z,Z,Z,Z,Z,Z]},
    "B"  : {0:[H,E,Z,Z,X,Z,Z,W,Z,Z,Z,Z,Z,A,B,Z,R,S,T,Q,Z,Z,N,O], 1:[H,Z,Z,Z,Z,Z,Z,W,Z,Z,Z,Z,Z,A,Z,Z,R,S,T,Q,Z,Z,N,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "B'" : {0:[N,O,Z,Z,B,Z,Z,A,Z,Z,Z,Z,Z,W,X,Z,T,Q,R,S,Z,Z,H,E], 1:[N,Z,Z,Z,Z,Z,Z,A,Z,Z,Z,Z,Z,W,Z,Z,T,Q,R,S,Z,Z,H,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "B2" : {0:[W,X,Z,Z,O,Z,Z,N,Z,Z,Z,Z,Z,H,E,Z,S,T,Q,R,Z,Z,A,B], 1:[W,Z,Z,Z,Z,Z,Z,N,Z,Z,Z,Z,Z,H,Z,Z,S,T,Q,R,Z,Z,A,Z], 2:[Z,Z,Z,Z,Z,Z]},
    "D"  : {0:[Z,Z,Z,Z,Z,Z,K,L,Z,Z,O,P,Z,Z,S,T,Z,Z,G,H,V,W,X,U], 1:[Z,Z,Z,Z,Z,Z,K,Z,Z,Z,O,Z,Z,Z,S,Z,Z,Z,G,Z,V,W,X,U], 2:[Z,Z,Z,Z,Z,Z]},
    "D'" : {0:[Z,Z,Z,Z,Z,Z,S,T,Z,Z,G,H,Z,Z,K,L,Z,Z,O,P,X,U,V,W], 1:[Z,Z,Z,Z,Z,Z,S,Z,Z,Z,G,Z,Z,Z,K,Z,Z,Z,O,Z,X,U,V,W], 2:[Z,Z,Z,Z,Z,Z]},
    "D2" : {0:[Z,Z,Z,Z,Z,Z,O,P,Z,Z,S,T,Z,Z,G,H,Z,Z,K,L,W,X,U,V], 1:[Z,Z,Z,Z,Z,Z,O,Z,Z,Z,S,Z,Z,Z,G,Z,Z,Z,K,Z,W,X,U,V], 2:[Z,Z,Z,Z,Z,Z]},

    // Slices
    "E"  : {0:[Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z], 1:[Z,Z,Z,Z,Z,J,Z,L,Z,N,Z,P,Z,R,Z,T,Z,F,Z,H,Z,Z,Z,Z], 2:[Z,2,3,4,1,Z]},
    "E'" : {0:[Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z], 1:[Z,Z,Z,Z,Z,R,Z,T,Z,F,Z,H,Z,J,Z,L,Z,N,Z,P,Z,Z,Z,Z], 2:[Z,4,1,2,3,Z]},
    "E2" : {0:[Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z], 1:[Z,Z,Z,Z,Z,N,Z,P,Z,R,Z,T,Z,F,Z,H,Z,J,Z,L,Z,Z,Z,Z], 2:[Z,3,4,1,2,Z]},
    "S"  : {0:[Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z], 1:[Z,O,Z,M,B,Z,D,Z,Z,Z,Z,Z,V,Z,X,Z,Z,Z,Z,Z,Z,G,Z,E], 2:[3,0,Z,5,Z,1]},
    "S'" : {0:[Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z], 1:[Z,E,Z,G,X,Z,V,Z,Z,Z,Z,Z,D,Z,B,Z,Z,Z,Z,Z,Z,M,Z,O], 2:[1,5,Z,0,Z,3]},
    "S2" : {0:[Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z], 1:[Z,X,Z,V,O,Z,M,Z,Z,Z,Z,Z,G,Z,E,Z,Z,Z,Z,Z,Z,D,Z,B], 2:[5,3,Z,1,Z,0]},
    "M"  : {0:[Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z], 1:[I,Z,K,Z,Z,Z,Z,Z,U,Z,W,Z,Z,Z,Z,Z,C,Z,A,Z,S,Z,Q,Z], 2:[2,Z,5,Z,0,4]},
    "M'" : {0:[Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z], 1:[S,Z,Q,Z,Z,Z,Z,Z,A,Z,C,Z,Z,Z,Z,Z,W,Z,U,Z,I,Z,K,Z], 2:[4,Z,0,Z,5,2]},
    "M2" : {0:[Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z], 1:[U,Z,W,Z,Z,Z,Z,Z,S,Z,Q,Z,Z,Z,Z,Z,K,Z,I,Z,A,Z,C,Z], 2:[5,Z,4,Z,2,0]},

    // Double layer
    "u"  : {0:[B,C,D,A,Q,R,Z,Z,E,F,Z,Z,I,J,Z,Z,M,N,Z,Z,Z,Z,Z,Z], 1:[B,C,D,A,Q,R,Z,T,E,F,Z,H,I,J,Z,L,M,N,Z,P,Z,Z,Z,Z], 2:[Z,4,1,2,3,Z]},
    "u'" : {0:[D,A,B,C,I,J,Z,Z,M,N,Z,Z,Q,R,Z,Z,E,F,Z,Z,Z,Z,Z,Z], 1:[D,A,B,C,I,J,Z,L,M,N,Z,P,Q,R,Z,T,E,F,Z,H,Z,Z,Z,Z], 2:[Z,2,3,4,1,Z]},
    "u2" : {0:[C,D,A,B,M,N,Z,Z,Q,R,Z,Z,E,F,Z,Z,I,J,Z,Z,Z,Z,Z,Z], 1:[C,D,A,B,M,N,Z,P,Q,R,Z,T,E,F,Z,H,I,J,Z,L,Z,Z,Z,Z], 2:[Z,3,4,1,2,Z]},
    "f"  : {0:[Z,Z,P,M,Z,C,D,Z,J,K,L,I,V,Z,Z,U,Z,Z,Z,Z,F,G,Z,Z], 1:[Z,O,P,M,B,C,D,Z,J,K,L,I,V,Z,X,U,Z,Z,Z,Z,F,G,Z,E], 2:[3,0,Z,5,Z,1]},
    "f'" : {0:[Z,Z,F,G,Z,U,V,Z,L,I,J,K,D,Z,Z,C,Z,Z,Z,Z,P,M,Z,Z], 1:[Z,E,F,G,X,U,V,Z,L,I,J,K,D,Z,B,C,Z,Z,Z,Z,P,M,Z,O], 2:[1,5,Z,0,Z,3]},
    "f2" : {0:[Z,Z,U,V,Z,P,M,Z,K,L,I,J,G,Z,Z,F,Z,Z,Z,Z,C,D,Z,Z], 1:[Z,X,U,V,O,P,M,Z,K,L,I,J,G,Z,E,F,Z,Z,Z,Z,C,D,Z,B], 2:[5,3,Z,1,Z,0]},
    "r"  : {0:[Z,T,Q,Z,Z,Z,Z,Z,Z,B,C,Z,N,O,P,M,W,Z,Z,V,Z,J,K,Z], 1:[S,T,Q,Z,Z,Z,Z,Z,A,B,C,Z,N,O,P,M,W,Z,U,V,I,J,K,Z], 2:[4,Z,0,Z,5,2]},
    "r'" : {0:[Z,J,K,Z,Z,Z,Z,Z,Z,V,W,Z,P,M,N,O,C,Z,Z,B,Z,T,Q,Z], 1:[I,J,K,Z,Z,Z,Z,Z,U,V,W,Z,P,M,N,O,C,Z,A,B,S,T,Q,Z], 2:[2,Z,5,Z,0,4]},
    "r2" : {0:[Z,V,W,Z,Z,Z,Z,Z,Z,T,Q,Z,O,P,M,N,K,Z,Z,J,Z,B,C,Z], 1:[U,V,W,Z,Z,Z,Z,Z,S,T,Q,Z,O,P,M,N,K,Z,I,J,A,B,C,Z], 2:[5,Z,4,Z,2,0]},
    "l"  : {0:[I,Z,Z,L,F,G,H,E,U,Z,Z,X,Z,Z,Z,Z,Z,D,A,Z,S,Z,Z,R], 1:[I,Z,K,L,F,G,H,E,U,Z,W,X,Z,Z,Z,Z,C,D,A,Z,S,Z,Q,R], 2:[2,Z,5,Z,0,4]},
    "l'" : {0:[S,Z,Z,R,H,E,F,G,A,Z,Z,D,Z,Z,Z,Z,Z,X,U,Z,I,Z,Z,L], 1:[S,Z,Q,R,H,E,F,G,A,Z,C,D,Z,Z,Z,Z,W,X,U,Z,I,Z,K,L], 2:[4,Z,0,Z,5,2]},
    "l2" : {0:[U,Z,Z,X,G,H,E,F,S,Z,Z,R,Z,Z,Z,Z,Z,L,I,Z,A,Z,Z,D], 1:[U,Z,W,X,G,H,E,F,S,Z,Q,R,Z,Z,Z,Z,K,L,I,Z,A,Z,C,D], 2:[5,Z,4,Z,2,0]},
    "b"  : {0:[H,E,Z,Z,X,Z,Z,W,Z,Z,Z,Z,Z,A,B,Z,R,S,T,Q,Z,Z,N,O], 1:[H,E,Z,G,X,Z,V,W,Z,Z,Z,Z,D,A,B,Z,R,S,T,Q,Z,M,N,O], 2:[1,5,Z,0,Z,3]},
    "b'" : {0:[N,O,Z,Z,B,Z,Z,A,Z,Z,Z,Z,Z,W,X,Z,T,Q,R,S,Z,Z,H,E], 1:[N,O,Z,M,B,Z,D,A,Z,Z,Z,Z,V,W,X,Z,T,Q,R,S,Z,G,H,E], 2:[3,0,Z,5,Z,1]},
    "b2" : {0:[W,X,Z,Z,O,Z,Z,N,Z,Z,Z,Z,Z,H,E,Z,S,T,Q,R,Z,Z,A,B], 1:[W,X,Z,V,O,Z,M,N,Z,Z,Z,Z,G,H,E,Z,S,T,Q,R,Z,D,A,B], 2:[5,3,Z,1,Z,0]},
    "d"  : {0:[Z,Z,Z,Z,Z,Z,K,L,Z,Z,O,P,Z,Z,S,T,Z,Z,G,H,V,W,X,U], 1:[Z,Z,Z,Z,Z,J,K,L,Z,N,O,P,Z,R,S,T,Z,F,G,H,V,W,X,U], 2:[Z,2,3,4,1,Z]},
    "d'" : {0:[Z,Z,Z,Z,Z,Z,S,T,Z,Z,G,H,Z,Z,K,L,Z,Z,O,P,X,U,V,W], 1:[Z,Z,Z,Z,Z,R,S,T,Z,F,G,H,Z,J,K,L,Z,N,O,P,X,U,V,W], 2:[Z,4,1,2,3,Z]},
    "d2" : {0:[Z,Z,Z,Z,Z,Z,O,P,Z,Z,S,T,Z,Z,G,H,Z,Z,K,L,W,X,U,V], 1:[Z,Z,Z,Z,Z,N,O,P,Z,R,S,T,Z,F,G,H,Z,J,K,L,W,X,U,V], 2:[Z,3,4,1,2,Z]},

    // Rotations
    "x"  : {0:[S,T,Q,R,H,E,F,G,A,B,C,D,N,O,P,M,W,X,U,V,I,J,K,L], 1:[S,T,Q,R,H,E,F,G,A,B,C,D,N,O,P,M,W,X,U,V,I,J,K,L], 2:[4,Z,0,Z,5,2]},
    "x'" : {0:[I,J,K,L,F,G,H,E,U,V,W,X,P,M,N,O,C,D,A,B,S,T,Q,R], 1:[I,J,K,L,F,G,H,E,U,V,W,X,P,M,N,O,C,D,A,B,S,T,Q,R], 2:[2,Z,5,Z,0,4]},
    "x2" : {0:[U,V,W,X,G,H,E,F,S,T,Q,R,O,P,M,N,K,L,I,J,A,B,C,D], 1:[U,V,W,X,G,H,E,F,S,T,Q,R,O,P,M,N,K,L,I,J,A,B,C,D], 2:[5,Z,4,Z,2,0]},
    "y"  : {0:[B,C,D,A,Q,R,S,T,E,F,G,H,I,J,K,L,M,N,O,P,X,U,V,W], 1:[B,C,D,A,Q,R,S,T,E,F,G,H,I,J,K,L,M,N,O,P,X,U,V,W], 2:[Z,4,1,2,3,Z]},
    "y'" : {0:[D,A,B,C,I,J,K,L,M,N,O,P,Q,R,S,T,E,F,G,H,V,W,X,U], 1:[D,A,B,C,I,J,K,L,M,N,O,P,Q,R,S,T,E,F,G,H,V,W,X,U], 2:[Z,2,3,4,1,Z]},
    "y2" : {0:[C,D,A,B,M,N,O,P,Q,R,S,T,E,F,G,H,I,J,K,L,W,X,U,V], 1:[C,D,A,B,M,N,O,P,Q,R,S,T,E,F,G,H,I,J,K,L,W,X,U,V], 2:[Z,3,4,1,2,Z]},
    "z"  : {0:[N,O,P,M,B,C,D,A,J,K,L,I,V,W,X,U,T,Q,R,S,F,G,H,E], 1:[N,O,P,M,B,C,D,A,J,K,L,I,V,W,X,U,T,Q,R,S,F,G,H,E], 2:[3,0,Z,5,Z,1]},
    "z'" : {0:[H,E,F,G,X,U,V,W,L,I,J,K,D,A,B,C,R,S,T,Q,P,M,N,O], 1:[H,E,F,G,X,U,V,W,L,I,J,K,D,A,B,C,R,S,T,Q,P,M,N,O], 2:[1,5,Z,0,Z,3]},
    "z2" : {0:[W,X,U,V,O,P,M,N,K,L,I,J,G,H,E,F,S,T,Q,R,C,D,A,B], 1:[W,X,U,V,O,P,M,N,K,L,I,J,G,H,E,F,S,T,Q,R,C,D,A,B], 2:[5,3,Z,1,Z,0]}
};

// M2 target solutions
var m2_edges = {};
m2_edges[A] = "M2";
m2_edges[B] = "[R' U R U': M2]";
m2_edges[C] = "U2 M' U2 M'";
m2_edges[D] = "[L U' L' U: M2]";
m2_edges[E] = "[B L' B': M2]";
m2_edges[F] = "[B L2 B': M2]";
m2_edges[G] = "[B L B': M2]";
m2_edges[H] = "[L' B L B': M2]";
m2_edges[I] = "D M' U R2 U' M U R2 U' D' M2";
m2_edges[J] = "[U R U': M2]";
m2_edges[L] = "[U' L' U: M2]";
m2_edges[M] = "[B' R B: M2]";
m2_edges[N] = "[R B' R' B: M2]";
m2_edges[O] = "[B' R' B: M2]";
m2_edges[P] = "[B' R2 B: M2]";
m2_edges[Q] = "[B' R B U R2 U': M2]";
m2_edges[R] = "[U' L U: M2]";
m2_edges[S] = "M2 D U R2 U' M' U R2 U' M D'";
m2_edges[T] = "[U R' U': M2]";
m2_edges[V] = "[U R2 U': M2]";
m2_edges[W] = "M U2 M U2";
m2_edges[X] = "[U' L2 U: M2]";

// Special m2 cases
var m2_mappings = {};
m2_mappings[C] = W;
m2_mappings[W] = C;
m2_mappings[I] = S;
m2_mappings[S] = I;

// OP setup moves
var op_setups = {};
op_setups[B] = "R D'";
op_setups[C] = "F";
op_setups[D] = "F R'";
op_setups[F] = "F2";
op_setups[G] = "D2 R";
op_setups[H] = "D2";
op_setups[I] = "F' D";
op_setups[J] = "F2 D";
op_setups[K] = "F D";
op_setups[L] = "D";
op_setups[M] = "R'";
op_setups[N] = "R2";
op_setups[O] = "R";
op_setups[P] = "";
op_setups[Q] = "R' F";
op_setups[S] = "D' R";
op_setups[T] = "D'";
op_setups[U] = "F'";
op_setups[V] = "D' F'";
op_setups[W] = "D2 F'";
op_setups[X] = "D F'";

// Y perm used for OP corners
var y_perm = "R U' R' U' R U R' F' R U R' U' R' F R";

// Ra perm used for OP parity
var ra_perm = "R U R' F' R U2 R' U2 R' F R U R U2 R' U'";

// OP setup moves for edges, buffer at B/M
var op_setups_edges = {};
op_setups_edges[A] = "l2 D' L2";
op_setups_edges[C] = "l2 D L2";
op_setups_edges[D] = "";
op_setups_edges[E] = "L' d L'";
op_setups_edges[F] = "d' L";
op_setups_edges[G] = "L d L'";
op_setups_edges[H] = "d L'";
op_setups_edges[I] = "l D' L2";
op_setups_edges[J] = "d2 L";
op_setups_edges[K] = "l D L2";
op_setups_edges[L] = "L'";
op_setups_edges[N] = "d L";
op_setups_edges[O] = "D' l D L2";
op_setups_edges[P] = "d' L'";
op_setups_edges[Q] = "l' D L2";
op_setups_edges[R] = "L";
op_setups_edges[S] = "l' D' L2";
op_setups_edges[T] = "d2 L'";
op_setups_edges[U] = "D' L2";
op_setups_edges[V] = "D2 L2";
op_setups_edges[W] = "D L2";
op_setups_edges[X] = "L2";

// T perm used for OP edges
var t_perm = "R U R' U' R' F R2 U' R' U' R U R' F'";




// Edge flip setups
var edge_flip_setups = {};
edge_flip_setups[A] = "U2";
edge_flip_setups[B] = "U";
edge_flip_setups[C] = "";
edge_flip_setups[D] = "U'";
edge_flip_setups[E] = "U'";
edge_flip_setups[F] = "L' U'";
edge_flip_setups[G] = "L2 U'";
edge_flip_setups[H] = "L U'";
edge_flip_setups[I] = "";
edge_flip_setups[J] = "R U";
edge_flip_setups[L] = "L' U'";
edge_flip_setups[M] = "U";
edge_flip_setups[N] = "R' U";
edge_flip_setups[O] = "R2 U";
edge_flip_setups[P] = "R U";
edge_flip_setups[Q] = "U2";
edge_flip_setups[R] = "L U'";
edge_flip_setups[S] = "x";
edge_flip_setups[T] = "R' U";
edge_flip_setups[V] = "R2 U";
edge_flip_setups[W] = "x";
edge_flip_setups[X] = "L2 U'";

// Alg used to flip UF and DF
var edge_flip_alg = "(M F)3 F (M' F)3 F";

// Corner flip setups
var corner_flip_setups = {};
corner_flip_setups[B] = "R' F'";
corner_flip_setups[C] = "F'";
corner_flip_setups[D] = "";
corner_flip_setups[F] = "";
corner_flip_setups[G] = "F";
corner_flip_setups[H] = "D F";
corner_flip_setups[I] = "";
corner_flip_setups[J] = "F'";
corner_flip_setups[K] = "F2";
corner_flip_setups[L] = "F";
corner_flip_setups[M] = "F'";
corner_flip_setups[N] = "R' F'";
corner_flip_setups[O] = "D' F2";
corner_flip_setups[P] = "F2";
corner_flip_setups[Q] = "R' F'";
corner_flip_setups[S] = "D F";
corner_flip_setups[T] = "D' F2";
corner_flip_setups[U] = "F";
corner_flip_setups[V] = "F2";
corner_flip_setups[W] = "D' F2";
corner_flip_setups[X] = "D F";

// Flips UFL and UBL corners
var cw_corner_flip_alg = "L' U2 L U L' U L R U2 R' U' R U' R'";
var ccw_corner_flip_alg = "R U R' U R U2 R' L' U' L U' L' U2 L";

// 3-Style edge solutions
var bh_edges = {};
bh_edges[A] = {};
bh_edges[A][B] = "[M2, R U R' U']";
bh_edges[A][M] = "[x': [M2, U' R U]]";
bh_edges[A][C] = "M' U2 M U2";
bh_edges[A][I] = "[D: [U R2 U', M']]";
bh_edges[A][D] = "[y': R' U' R U R U R U' R' U']";
bh_edges[A][E] = "[x': [M2, U L' U']]";
bh_edges[A][H] = "[x: [U L2 U', M2]]";
bh_edges[A][R] = "[M2, U' L U]";
bh_edges[A][T] = "[M2, U R' U']";
bh_edges[A][N] = "[x: [U' R2 U, M2]]";
bh_edges[A][P] = "[x': [M2, U' R2 U]]";
bh_edges[A][J] = "[M2, U R U']";
bh_edges[A][L] = "[M2, U' L' U]";
bh_edges[A][F] = "[x': [M2, U L2 U']]";
bh_edges[A][S] = "[x: U' M2 R U' R' U M U' R U r' U]";
bh_edges[A][W] = "M2 U2 M' U2 M'";
bh_edges[A][O] = "[x': [M2, U' R' U]]";
bh_edges[A][V] = "[M2, U R2 U']";
bh_edges[A][G] = "[x': [M2, U L U']]";
bh_edges[A][X] = "[M2, U' L2 U]";

bh_edges[B] = {};
bh_edges[B][A] = "[R U R' U', M2]";
bh_edges[B][Q] = "[x' U2: [U R U', M]]";
bh_edges[B][C] = "U M U2 M U' M' U2 M'";
bh_edges[B][I] = "[x: [U R' U', M']]";
bh_edges[B][D] = "U' M' U2 M U'";
bh_edges[B][E] = "[y': [U R2 U', M']]";
bh_edges[B][H] = "[z' U2: [R, U' M U]]";
bh_edges[B][R] = "[L: U' M' U2 M U']";
bh_edges[B][T] = "[U' M2 U, R']";
bh_edges[B][N] = "[u': [M2, U' L U]]";
bh_edges[B][P] = "[u': [M2, U R' U']]";
bh_edges[B][J] = "[U' M2 U, R]";
bh_edges[B][L] = "[L': U' M' U2 M U']";
bh_edges[B][F] = "[z' U2: [R, U M' U']]";
bh_edges[B][S] = "[x': [U R U', M]]";
bh_edges[B][W] = "u M u2 M u";
bh_edges[B][O] = "[y': [U R2 U', M]]";
bh_edges[B][V] = "[U' M2 U, R2]";
bh_edges[B][G] = "[y' U: [R2, U M' U']]";
bh_edges[B][X] = "[y': [U R2 U', M2]]";

bh_edges[C] = {};
bh_edges[C][A] = "U2 M' U2 M";
bh_edges[C][Q] = "[y': [R2, U' M' U]]";
bh_edges[C][B] = "M U2 M U M' U2 M' U'";
bh_edges[C][M] = "[x: R U R U R2 U' R' U' R' U2]";
bh_edges[C][D] = "M U2 M U' M' U2 M' U";
bh_edges[C][E] = "[u' x: [U R' U', M']]";
bh_edges[C][H] = "[x y': U' M' U2 M U']";
bh_edges[C][R] = "[U2: [M2, U' L U]]";
bh_edges[C][T] = "[U2: [M2, U R' U']]";
bh_edges[C][N] = "[x y: U M' U2 M U]";
bh_edges[C][P] = "[x y: R2 U R U R' U' R' U' R' U R']";
bh_edges[C][J] = "[U2: [M2, U R U']]";
bh_edges[C][L] = "[U2: [M2, U' L' U]]";
bh_edges[C][F] = "[x y': R U' R U R U R U' R' U' R2]";
bh_edges[C][S] = "[U': [M', D R2 D']]";
bh_edges[C][W] = "[x: U2 M' U2 M]";
bh_edges[C][O] = "[y': [R2, U' M U]]";
bh_edges[C][V] = "[U2: [M2, U R2 U']]";
bh_edges[C][G] = "[y': [R2, U M' U']]";
bh_edges[C][X] = "[U2: [M2, U' L2 U]]";

bh_edges[D] = {};
bh_edges[D][A] = "[y': U R U R' U' R' U' R' U R]";
bh_edges[D][Q] = "[x' U2: [U' L' U, M]]";
bh_edges[D][B] = "U M' U2 M U";
bh_edges[D][M] = "[y: [U' L2 U, M']]";
bh_edges[D][C] = "U' M U2 M U M' U2 M'";
bh_edges[D][I] = "[x: [U' L U, M']]";
bh_edges[D][H] = "[u: [M2, U R' U']]";
bh_edges[D][R] = "[U M2 U', L]";
bh_edges[D][T] = "[R': U M' U2 M U]";
bh_edges[D][N] = "[z U2: [L', U M U']]";
bh_edges[D][P] = "[z U2: [L', U' M' U]]";
bh_edges[D][J] = "[R: U M' U2 M U]";
bh_edges[D][L] = "[U M2 U', L']";
bh_edges[D][F] = "[u: [M2, U' L U]]";
bh_edges[D][S] = "[x': [U' L' U, M]]";
bh_edges[D][W] = "u' M u2 M u'";
bh_edges[D][O] = "[y' U': [R2, U' M U]]";
bh_edges[D][V] = "[y': [U' R2 U, M2]]";
bh_edges[D][G] = "[y': [U' R2 U, M']]";
bh_edges[D][X] = "[U M2 U', L2]";

bh_edges[E] = {};
bh_edges[E][A] = "[x': [U L' U', M2]]";
bh_edges[E][Q] = "(M' U' M U')2";
bh_edges[E][B] = "[y': [M', U R2 U']]";
bh_edges[E][M] = "[M: U' M U2 M' U']";
bh_edges[E][C] = "[M: u M' u2 M' u]";
bh_edges[E][I] = "[L' U L U', M']";
bh_edges[E][H] = "[U' M' U, L]";
bh_edges[E][R] = "[u': [M', U L' U']]";
bh_edges[E][T] = "[u': [M', U L U']]";
bh_edges[E][N] = "[r': U' M U2 M' U']";
bh_edges[E][P] = "[U': [M', U' R U]]";
bh_edges[E][J] = "[U': [D R' D', M]]";
bh_edges[E][L] = "[u': [M', U' R U]]";
bh_edges[E][F] = "[U' M' U, L']";
bh_edges[E][S] = "[x: [M', U L U']]";
bh_edges[E][W] = "[z L: [U M' U', L2]]";
bh_edges[E][O] = "[U': [M', U' R2 U]]";
bh_edges[E][V] = "[z L2: [U M' U', L]]";
bh_edges[E][G] = "[U' M' U, L2]";
bh_edges[E][X] = "[z: [U M' U', L']]";

bh_edges[F] = {};
bh_edges[F][A] = "[x': [U L2 U', M2]]";
bh_edges[F][Q] = "[U': [L', U' M' U]]";
bh_edges[F][B] = "[z' U': [M', U' R U]]";
bh_edges[F][M] = "[x: R U R U R' U' R' U' R' U]";
bh_edges[F][C] = "[x y': R2 U R U R' U' R' U' R' U R']";
bh_edges[F][I] = "[U L' U', M']";
bh_edges[F][D] = "[u: [U' L U, M2]]";
bh_edges[F][E] = "[L', U' M' U]";
bh_edges[F][H] = "[L': [U' M' U, L2]]";
bh_edges[F][R] = "[z: [M', U' L' U]]";
bh_edges[F][T] = "[z' U: [U M' U', R]]";
bh_edges[F][N] = "[x: U R U R' U' R' U' R' U R]";
bh_edges[F][P] = "[x: R2 U R U R' U' R' U' R' U R']";
bh_edges[F][J] = "[z': [M', U' R U]]";
bh_edges[F][S] = "[x: [M', L' U L U']]";
bh_edges[F][W] = "[z' R': [U M' U', R2]]";
bh_edges[F][O] = "[x: R' U R U R' U' R' U' R' U R2]";
bh_edges[F][V] = "[z': [U M' U', R]]";
bh_edges[F][G] = "[L': [U' M' U, L']]";
bh_edges[F][X] = "[z' R2: [U M' U', R']]";

bh_edges[G] = {};
bh_edges[G][A] = "[x': [U L U', M2]]";
bh_edges[G][Q] = "[U': [L2, U' M' U]]";
bh_edges[G][B] = "[y' U2: [M', U' R2 U]]";
bh_edges[G][M] = "[U2: [L2, U' M' U]]";
bh_edges[G][C] = "[y': [U M' U', R2]]";
bh_edges[G][I] = "[U L2 U', M']";
bh_edges[G][D] = "[y': [M', U' R2 U]]";
bh_edges[G][E] = "[L2, U' M' U]";
bh_edges[G][H] = "[L2: [U' M' U, L']]";
bh_edges[G][R] = "[y' R: [L D' L', E']]";
bh_edges[G][T] = "[R' L2 y': [M', U R2 U']]";
bh_edges[G][N] = "[x' L: U' M U2 M' U']";
bh_edges[G][P] = "[x L': R2 U R U R' U' R' U' R' U R']";
bh_edges[G][J] = "[L': [E, R' D R]]";
bh_edges[G][L] = "[L' U: [B L2 B', M2]]";
bh_edges[G][F] = "[L2: [U' M' U, L]]";
bh_edges[G][S] = "[x: [M', U L' U']]";
bh_edges[G][W] = "[B2: [B L B', M2]]";
bh_edges[G][O] = "[x L' R: R2 U R U R' U' R' U' R' U R']";
bh_edges[G][V] = "[y' M': [U' R2 U, M']]";

bh_edges[H] = {};
bh_edges[H][A] = "[x: [M2, U L2 U']]";
bh_edges[H][Q] = "[U2: [U L U', M']]";
bh_edges[H][B] = "[z' U2: [U' M U, R]]";
bh_edges[H][M] = "[l: U' M U2 M' U']";
bh_edges[H][C] = "[x y': U M' U2 M U]";
bh_edges[H][I] = "[U L U', M']";
bh_edges[H][D] = "[u: [U R' U', M2]]";
bh_edges[H][E] = "[L, U' M' U]";
bh_edges[H][T] = "[z': [M, U R U']]";
bh_edges[H][N] = "[x': U' M U2 M' U']";
bh_edges[H][P] = "[z' l: [U R U', M2]]";
bh_edges[H][J] = "[z' U': [U' M U, R]]";
bh_edges[H][L] = "[z: [M, U L' U']]";
bh_edges[H][F] = "[L: [U' M' U, L2]]";
bh_edges[H][S] = "[x: [M', U L2 U']]";
bh_edges[H][W] = "[z' R': [U' M U, R2]]";
bh_edges[H][O] = "[x' R': U' M U2 M' U']";
bh_edges[H][V] = "[z': [U' M U, R]]";
bh_edges[H][G] = "[L: [U' M' U, L]]";
bh_edges[H][X] = "[z' R: [R, U' M U]]";

bh_edges[I] = {};
bh_edges[I][A] = "[D: [M', U R2 U']]";
bh_edges[I][Q] = "[U' M: U M U2 M' U]";
bh_edges[I][B] = "[x: [M', U R' U']]";
bh_edges[I][M] = "[M', R U' R' U]";
bh_edges[I][D] = "[x: [M', U' L U]]";
bh_edges[I][E] = "[M', L' U L U']";
bh_edges[I][H] = "[M', U L U']";
bh_edges[I][R] = "[x: [M', U' L2 U]]";
bh_edges[I][T] = "[x: [M', U R2 U']]";
bh_edges[I][N] = "[M', U' R' U]";
bh_edges[I][P] = "[M', U' R U]";
bh_edges[I][J] = "[x: [M', R U R' U']]";
bh_edges[I][L] = "[M': [M', U' L' U]]";
bh_edges[I][F] = "[M', U L' U']";
bh_edges[I][S] = "[U' M': [M', R U' R' U]]";
bh_edges[I][W] = "U' M U' M' U2 M' U M U'";
bh_edges[I][O] = "[M', U' R2 U]";
bh_edges[I][V] = "[x: [M', U R U']]";
bh_edges[I][G] = "[M', U L2 U']";
bh_edges[I][X] = "[x: [M', U' L' U]]";

bh_edges[J] = {};
bh_edges[J][A] = "[U R U', M2]";
bh_edges[J][Q] = "[x' U2: [U R2 U', M]]";
bh_edges[J][B] = "[R, U' M2 U]";
bh_edges[J][M] = "[u: [U L' U', M']]";
bh_edges[J][C] = "[U2: [U R U', M2]]";
bh_edges[J][I] = "[x: [R U R' U', M']]";
bh_edges[J][D] = "[R: U' M' U2 M U']";
bh_edges[J][E] = "[U': [M, D R' D']]";
bh_edges[J][H] = "[z' U': [R, U' M U]]";
bh_edges[J][R] = "[z: [M2, U' L' U]]";
bh_edges[J][T] = "[R: [U' M2 U, R2]]";
bh_edges[J][N] = "[z': [U' R U, M]]";
bh_edges[J][L] = "[L' R: U' M' U2 M U']";
bh_edges[J][F] = "[z': [U' R U, M']]";
bh_edges[J][S] = "[x': [U R2 U', M]]";
bh_edges[J][W] = "[z L: [U M2 U', L2]]";
bh_edges[J][O] = "[R U': [M2, B' R2 B]]";
bh_edges[J][V] = "[R: [U' M2 U, R]]";
bh_edges[J][G] = "[L': [R' D R, E]]";
bh_edges[J][X] = "[z: [U M2 U', L']]";

bh_edges[L] = {};
bh_edges[L][A] = "[U' L' U, M2]";
bh_edges[L][Q] = "[x' U2: [U' L2 U, M]]";
bh_edges[L][B] = "[L': U M' U2 M U]";
bh_edges[L][M] = "[u: [U L U', M']]";
bh_edges[L][C] = "[U: [L', U M2 U']]";
bh_edges[L][I] = "[M': [U' L' U, M']]";
bh_edges[L][D] = "[L', U M2 U']";
bh_edges[L][E] = "[u': [U' R U, M']]";
bh_edges[L][H] = "[z: [U L' U', M]]";
bh_edges[L][R] = "[L': [U M2 U', L2]]";
bh_edges[L][T] = "[z': [M2, U R U']]";
bh_edges[L][N] = "[z U: [L', U M U']]";
bh_edges[L][P] = "[z: [U L' U', M']]";
bh_edges[L][J] = "[L' R: U M' U2 M U]";
bh_edges[L][S] = "[x': [U' L2 U, M]]";
bh_edges[L][W] = "[z' R': [U' M2 U, R2]]";
bh_edges[L][O] = "[R: [L D' L', E']]";
bh_edges[L][V] = "[z': [U' M2 U, R]]";
bh_edges[L][G] = "[L' U: [M2, B L2 B']]";
bh_edges[L][X] = "[L': [U M2 U', L']]";

bh_edges[M] = {};
bh_edges[M][A] = "[x': [U' R U, M2]]";
bh_edges[M][Q] = "(M' U M U)2";
bh_edges[M][C] = "[M: u' M' u2 M' u']";
bh_edges[M][I] = "[R U' R' U, M']";
bh_edges[M][D] = "[y: [M', U' L2 U]]";
bh_edges[M][E] = "[M: U M U2 M' U]";
bh_edges[M][H] = "[l: U M U2 M' U]";
bh_edges[M][R] = "[u: [M', U' R' U]]";
bh_edges[M][T] = "[u: [M', U' R U]]";
bh_edges[M][N] = "[U M' U', R']";
bh_edges[M][P] = "[U M' U', R]";
bh_edges[M][J] = "[u: [M', U L' U']]";
bh_edges[M][L] = "[u: [M', U L U']]";
bh_edges[M][F] = "[x: U' R U R U R U' R' U' R']";
bh_edges[M][S] = "[x: [M', U' R' U]]";
bh_edges[M][W] = "[z' R': [U' M' U, R2]]";
bh_edges[M][O] = "[U M' U', R2]";
bh_edges[M][V] = "[z': [U' M' U, R]]";
bh_edges[M][G] = "[U: [M', U L2 U']]";
bh_edges[M][X] = "[z' R2: [U' M' U, R']]";

bh_edges[N] = {};
bh_edges[N][A] = "[x: [M2, U' R2 U]]";
bh_edges[N][Q] = "[U2: [U' R' U, M']]";
bh_edges[N][B] = "[u': [U' L U, M2]]";
bh_edges[N][M] = "[R', U M' U']";
bh_edges[N][C] = "[x y: U' M' U2 M U']";
bh_edges[N][I] = "[U' R' U, M']";
bh_edges[N][D] = "[z U2: [U M U', L']]";
bh_edges[N][E] = "[r': U M U2 M' U]";
bh_edges[N][H] = "[x': U M U2 M' U]";
bh_edges[N][R] = "[z: [M, U' L' U]]";
bh_edges[N][P] = "[R': [U M' U', R2]]";
bh_edges[N][J] = "[z': [M, U' R U]]";
bh_edges[N][L] = "[z U: [U M U', L']]";
bh_edges[N][F] = "[x: R' U' R U R U R U' R' U']";
bh_edges[N][S] = "[x: [M', U' R2 U]]";
bh_edges[N][W] = "[z L: [U M U', L2]]";
bh_edges[N][O] = "[R': [U M' U', R']]";
bh_edges[N][V] = "[z L2: [U M U', L]]";
bh_edges[N][G] = "[x' L: U M U2 M' U]";
bh_edges[N][X] = "[z: [U M U', L']]";

bh_edges[O] = {};
bh_edges[O][A] = "[x': [U' R' U, M2]]";
bh_edges[O][Q] = "[U: [R2, U M' U']]";
bh_edges[O][B] = "[y': [M, U R2 U']]";
bh_edges[O][M] = "[R2, U M' U']";
bh_edges[O][C] = "[y': [U' M U, R2]]";
bh_edges[O][I] = "[U' R2 U, M']";
bh_edges[O][D] = "[y' U2: [M, U R2 U']]";
bh_edges[O][E] = "[U': [U' R2 U, M']]";
bh_edges[O][H] = "[x' R': U M U2 M' U]";
bh_edges[O][R] = "[R': [E, L' D' L]]";
bh_edges[O][T] = "[y L': [R' D R, E]]";
bh_edges[O][N] = "[R2: [U M' U', R]]";
bh_edges[O][P] = "[R2: [U M' U', R']]";
bh_edges[O][J] = "[R U': [B' R2 B, M2]]";
bh_edges[O][L] = "[R: [E', L D' L']]";
bh_edges[O][F] = "[x: R2 U' R U R U R U' R' U' R]";
bh_edges[O][S] = "[x: [M', U' R U]]";
bh_edges[O][W] = "[B2: [B' R' B, M2]]";
bh_edges[O][G] = "[x L' R: R U' R U R U R U' R' U' R2]";
bh_edges[O][X] = "[y M': [U L2 U', M']]";

bh_edges[P] = {};
bh_edges[P][A] = "[x': [U' R2 U, M2]]";
bh_edges[P][Q] = "[U: [R, U M' U']]";
bh_edges[P][B] = "[u': [U R' U', M2]]";
bh_edges[P][M] = "[R, U M' U']";
bh_edges[P][C] = "[x y: R U' R U R U R U' R' U' R2]";
bh_edges[P][I] = "[U' R U, M']";
bh_edges[P][D] = "[z U2: [U' M' U, L']]";
bh_edges[P][E] = "[U': [U' R U, M']]";
bh_edges[P][H] = "[z' l': [U R U', M2]]";
bh_edges[P][R] = "[z U': [U' M' U, L']]";
bh_edges[P][T] = "[z': [M', U R U']]";
bh_edges[P][N] = "[R: [U M' U', R2]]";
bh_edges[P][L] = "[z: [M', U L' U']]";
bh_edges[P][F] = "[x: R U' R U R U R U' R' U' R2]";
bh_edges[P][S] = "[x: [M', R U' R' U]]";
bh_edges[P][W] = "[z L: [U' M' U, L2]]";
bh_edges[P][O] = "[R: [U M' U', R]]";
bh_edges[P][V] = "[z L2: [U' M' U, L]]";
bh_edges[P][G] = "[x L': R U' R U R U R U' R' U' R2]";
bh_edges[P][X] = "[z: [U' M' U, L']]";

bh_edges[Q] = {};
bh_edges[Q][B] = "[x' U2: [M, U R U']]";
bh_edges[Q][M] = "[x U': [R', U' M U]]";
bh_edges[Q][C] = "[y': [U' M' U, R2]]";
bh_edges[Q][I] = "[U M: U M U2 M' U]";
bh_edges[Q][D] = "[x' U2: [M, U' L' U]]";
bh_edges[Q][E] = "(U M' U M)2";
bh_edges[Q][H] = "[U2: [M', U L U']]";
bh_edges[Q][R] = "[x' y': [U, M D M']]";
bh_edges[Q][T] = "[U2 M': [M', U R' U']]";
bh_edges[Q][N] = "[U2: [M', U' R' U]]";
bh_edges[Q][P] = "[U2: [M', U' R U]]";
bh_edges[Q][J] = "[x' U2: [M, U R2 U']]";
bh_edges[Q][L] = "[x' U2: [M, U' L2 U]]";
bh_edges[Q][F] = "[U2: [M', U L' U']]";
bh_edges[Q][S] = "[x: U' M U' M' U2 M' U M U']";
bh_edges[Q][W] = "[z' x': [U' M' U, R2]]";
bh_edges[Q][O] = "[U2: [M', U' R2 U]]";
bh_edges[Q][V] = "[x' U2: [M, U R' U']]";
bh_edges[Q][G] = "[U2: [M', U L2 U']]";
bh_edges[Q][X] = "[x' U2: [M, U' L U]]";

bh_edges[R] = {};
bh_edges[R][A] = "[U' L U, M2]";
bh_edges[R][Q] = "[x': (M U M' U)2]";
bh_edges[R][B] = "[L: U M' U2 M U]";
bh_edges[R][M] = "[u: [U' R' U, M']]";
bh_edges[R][C] = "[U: [L, U M2 U']]";
bh_edges[R][I] = "[M': [U' L U, M']]";
bh_edges[R][D] = "[L, U M2 U']";
bh_edges[R][E] = "[u': [U L' U', M']]";
bh_edges[R][T] = "[L R': U M' U2 M U]";
bh_edges[R][N] = "[z: [U' L' U, M]]";
bh_edges[R][P] = "[z U': [L', U' M' U]]";
bh_edges[R][J] = "[z: [U' L' U, M2]]";
bh_edges[R][L] = "[L: [U M2 U', L2]]";
bh_edges[R][F] = "[z: [U' L' U, M']]";
bh_edges[R][S] = "[M: [U' L U, M]]";
bh_edges[R][W] = "[z' R': [U M2 U', R2]]";
bh_edges[R][O] = "[R': [L' D' L, E]]";
bh_edges[R][V] = "[z': [U M2 U', R]]";
bh_edges[R][G] = "[y' R: [E', L D' L']]";
bh_edges[R][X] = "[L: [U M2 U', L]]";

bh_edges[S] = {};
bh_edges[S][A] = "[x U': r [U' R' U, M'] r']";
bh_edges[S][Q] = "[x: U M' U' M U2 M U M' U]";
bh_edges[S][B] = "[x': [M, U R U']]";
bh_edges[S][M] = "[x: [U' R' U, M']]";
bh_edges[S][C] = "[U': [D R2 D', M']]";
bh_edges[S][I] = "[U' M': [R U' R' U, M']]";
bh_edges[S][D] = "[x': [M, U' L' U]]";
bh_edges[S][E] = "[x: [U L U', M']]";
bh_edges[S][H] = "[x: [U L2 U', M']]";
bh_edges[S][R] = "[M2: [U' L U, M']]";
bh_edges[S][T] = "[M2: [U R' U', M']]";
bh_edges[S][N] = "[x: [U' R2 U, M']]";
bh_edges[S][P] = "[M': [U' R U, M']]";
bh_edges[S][J] = "[x': [M, U R2 U']]";
bh_edges[S][L] = "[x': [M, U' L2 U]]";
bh_edges[S][F] = "[M': [U L' U', M']]";
bh_edges[S][O] = "[x: [U' R U, M']]";
bh_edges[S][V] = "[x': [M, U R' U']]";
bh_edges[S][G] = "[x: [U L' U', M']]";
bh_edges[S][X] = "[x': [M, U' L U]]";

bh_edges[T] = {};
bh_edges[T][A] = "[U R' U', M2]";
bh_edges[T][Q] = "[U2 M': [U R' U', M']]";
bh_edges[T][B] = "[R', U' M2 U]";
bh_edges[T][M] = "[u: [U' R U, M']]";
bh_edges[T][C] = "[U': [R', U' M2 U]]";
bh_edges[T][I] = "[x: [U R2 U', M']]";
bh_edges[T][D] = "[R': U' M' U2 M U']";
bh_edges[T][E] = "[u': [U L U', M']]";
bh_edges[T][H] = "[z': [U R U', M]]";
bh_edges[T][R] = "[L R': U' M' U2 M U']";
bh_edges[T][P] = "[z': [U R U', M']]";
bh_edges[T][J] = "[R': [U' M2 U, R2]]";
bh_edges[T][L] = "[z': [U R U', M2]]";
bh_edges[T][F] = "[z' U: [R, U M' U']]";
bh_edges[T][S] = "[M: [U R' U', M]]";
bh_edges[T][W] = "[z L: [U' M2 U, L2]]";
bh_edges[T][O] = "[y L': [E, R' D R]]";
bh_edges[T][V] = "[R': [U' M2 U, R']]";
bh_edges[T][G] = "[R' L2 y': [U R2 U', M']]";
bh_edges[T][X] = "[z: [U' M2 U, L']]";

bh_edges[V] = {};
bh_edges[V][A] = "[U R2 U', M2]";
bh_edges[V][Q] = "[x' U2: [U R' U', M]]";
bh_edges[V][B] = "[R2, U' M2 U]";
bh_edges[V][M] = "[z': [R, U' M' U]]";
bh_edges[V][C] = "[U': [R2, U' M2 U]]";
bh_edges[V][I] = "[x: [U R U', M']]";
bh_edges[V][D] = "[y': [M2, U' R2 U]]";
bh_edges[V][E] = "[z L': [U M' U', L']]";
bh_edges[V][H] = "[z': [R, U' M U]]";
bh_edges[V][R] = "[z': [R, U M2 U']]";
bh_edges[V][T] = "[R2: [U' M2 U, R]]";
bh_edges[V][N] = "[z L': [U M U', L']]";
bh_edges[V][P] = "[z L': [U' M' U, L']]";
bh_edges[V][J] = "[R2: [U' M2 U, R']]";
bh_edges[V][L] = "[z': [R, U' M2 U]]";
bh_edges[V][F] = "[z': [R, U M' U']]";
bh_edges[V][S] = "[x': [U R' U', M]]";
bh_edges[V][W] = "[R2 U M': U2 M' U2 M]";
bh_edges[V][G] = "[y M2: [U' L2 U, M']]";
bh_edges[V][X] = "[L2 R2: U' M' U2 M U']";

bh_edges[W] = {};
bh_edges[W][A] = "M' u2 M' u2";
bh_edges[W][Q] = "[M2: [U' M: U' M U2 M' U']]";
bh_edges[W][B] = "u' M' u2 M' u'";
bh_edges[W][M] = "[z' R: [U' M' U, R2]]";
bh_edges[W][C] = "u2 M' u2 M'";
bh_edges[W][I] = "U M' U' M U2 M U M' U";
bh_edges[W][D] = "u M' u2 M' u";
bh_edges[W][E] = "[z L': [U M' U', L2]]";
bh_edges[W][H] = "[z' R: [U' M U, R2]]";
bh_edges[W][R] = "[z' R: [U M2 U', R2]]";
bh_edges[W][T] = "[z L': [U' M2 U, L2]]";
bh_edges[W][N] = "[z L': [U M U', L2]]";
bh_edges[W][P] = "[z L': [U' M' U, L2]]";
bh_edges[W][J] = "[z L': [U M2 U', L2]]";
bh_edges[W][L] = "[z' R: [U' M2 U, R2]]";
bh_edges[W][F] = "[z' R: [U M' U', R2]]";
bh_edges[W][O] = "[B2: [M2, B' R' B]]";
bh_edges[W][V] = "[R2: u' M' u2 M' u']";
bh_edges[W][G] = "[B2: [M2, B L B']]";
bh_edges[W][X] = "[L2: u M' u2 M' u]";

bh_edges[X] = {};
bh_edges[X][A] = "[U' L2 U, M2]";
bh_edges[X][Q] = "[x' U2: [U' L U, M]]";
bh_edges[X][B] = "[y': [M2, U R2 U']]";
bh_edges[X][M] = "[z' R2: [R', U' M' U]]";
bh_edges[X][C] = "[U: [L2, U M2 U']]";
bh_edges[X][I] = "[x: [U' L' U, M']]";
bh_edges[X][D] = "[L2, U M2 U']";
bh_edges[X][E] = "[z: [L', U M' U']]";
bh_edges[X][H] = "[z' R: [U' M U, R]]";
bh_edges[X][R] = "[L2: [U M2 U', L']]";
bh_edges[X][T] = "[z: [L', U' M2 U]]";
bh_edges[X][N] = "[z: [L', U M U']]";
bh_edges[X][P] = "[z: [L', U' M' U]]";
bh_edges[X][J] = "[z: [L', U M2 U']]";
bh_edges[X][L] = "[L2: [U M2 U', L]]";
bh_edges[X][F] = "[z' R: [U M' U', R]]";
bh_edges[X][S] = "[x': [U' L U, M]]";
bh_edges[X][W] = "[L2 U' M': U2 M' U2 M]";
bh_edges[X][O] = "[y' M2: [U R2 U', M']]";
bh_edges[X][V] = "[L2 R2: U M' U2 M U]";

// 3-style corner solutions
var bh_corners = {};
bh_corners[B] = {};
bh_corners[B][C] = "[x R2: [R U R', D2]]";
bh_corners[B][D] = "[y x R2: [R U R', D2]]";
bh_corners[B][F] = "[y R': [U2, R' D' R]]";
bh_corners[B][G] = "[y: [U, R' D2 R]]";
bh_corners[B][H] = "[U, R D' R']";
bh_corners[B][I] = "[x: [U R' U', L]]";
bh_corners[B][J] = "[x' z: [R U R', D]]";
bh_corners[B][K] = "[L' D2 L, U']";
bh_corners[B][L] = "[U, R D2 R']";
bh_corners[B][M] = "[y R: [R D R', U2]]";
bh_corners[B][O] = "[U, R D R']";
bh_corners[B][P] = "[y: [R D2 R', U']]";
bh_corners[B][S] = "[y': [L D L', U']]";
bh_corners[B][T] = "[y: [U, R' D' R]]";
bh_corners[B][U] = "[z': [R U2 R', D2]]";
bh_corners[B][V] = "[z': [U2, R' D2 R]]";
bh_corners[B][W] = "[z' R': [U2, R' D2 R]]";
bh_corners[B][X] = "[z' R: [R U2 R', D2]]";

bh_corners[C] = {};
bh_corners[C][B] = "[x R2: [D2, R U R']]";
bh_corners[C][D] = "[R': [U, L' D2 L]]";
bh_corners[C][F] = "[F: [R' D' R, U2]]";
bh_corners[C][G] = "[U2, R' D R]";
bh_corners[C][H] = "[L' D' L, U2]";
bh_corners[C][I] = "[x R': [R' D2 R, U2]]";
bh_corners[C][K] = "[L' D2 L, U2]";
bh_corners[C][L] = "[y: [R D' R', U2]]";
bh_corners[C][N] = "[F: [R2, U' L' U]]";
bh_corners[C][O] = "[L' D L, U2]";
bh_corners[C][P] = "[U2, R' D' R]";
bh_corners[C][Q] = "[R': [U2, L' D2 L]]";
bh_corners[C][S] = "[U2, R' D2 R]";
bh_corners[C][T] = "[y': [U2, R D' R']]";
bh_corners[C][U] = "[D: [U2, R' F' R2 F R]]";
bh_corners[C][V] = "[U2, R' F' R2 F R]";
bh_corners[C][W] = "[D': [U2, R' F' R2 F R]]";
bh_corners[C][X] = "[D2: [U2, R' F' R2 F R]]";

bh_corners[D] = {};
bh_corners[D][B] = "[y x R2: [D2, R U R']]";
bh_corners[D][C] = "[y' x' R: [U', R D2 R']]";
bh_corners[D][G] = "[U', L D L']";
bh_corners[D][H] = "[L' D' L, U]";
bh_corners[D][J] = "[L': [L' D' L, U2]]";
bh_corners[D][K] = "[L' D2 L, U]";
bh_corners[D][L] = "[y: [R D' R', U]]";
bh_corners[D][M] = "[x': [D, R U' R']]";
bh_corners[D][N] = "[x' z': [U' R U, L']]";
bh_corners[D][O] = "[y': [U', R' D2 R]]";
bh_corners[D][P] = "[y: [R D2 R', U]]";
bh_corners[D][Q] = "[R2: [L' D2 L, U]]";
bh_corners[D][S] = "[y': [U', R' D R]]";
bh_corners[D][T] = "[U', L D2 L']";
bh_corners[D][U] = "[x' y R: [D2, R U2 R']]";
bh_corners[D][V] = "[x': [L' U' L, D2]]";
bh_corners[D][W] = "[x: [D2, L U L']]";
bh_corners[D][X] = "[x' y R': [R' D2 R, U2]]";

bh_corners[F] = {};
bh_corners[F][B] = "[y R': [R' D' R, U2]]";
bh_corners[F][C] = "[x' U2: [R2, U' L2 U]]";
bh_corners[F][G] = "[y' L': [U2, R' D' R]]";
bh_corners[F][H] = "[y' R: [U2, R D2 R']]";
bh_corners[F][J] = "[y' R: [U2, R D R']]";
bh_corners[F][K] = "[y L: [R D' R', U2]]";
bh_corners[F][L] = "[x U R': [R' D2 R, U2]]";
bh_corners[F][M] = "[F: [U2, R' F' R2 F R]]";
bh_corners[F][N] = "[x z R': [U2, R' D2 R]]";
bh_corners[F][O] = "[x z R': [U2, R' D R]]";
bh_corners[F][P] = "[x' y': [R2' U R2 U' R2', D2]]";
bh_corners[F][Q] = "[R' F: [U2, R' D' R]]";
bh_corners[F][S] = "[x' z R: [R D R', U2]]";
bh_corners[F][T] = "[y' R: [U2, R D' R']]";
bh_corners[F][U] = "[z x' U2: [L2, U R2 U']]";
bh_corners[F][V] = "[F: [U2, R' D R]]";
bh_corners[F][W] = "[x' y': [U2, R' F' R2 F R]]";
bh_corners[F][X] = "[z R': [U2, R' F' R2 F R]]";

bh_corners[G] = {};
bh_corners[G][B] = "[y: [R' D2 R, U]]";
bh_corners[G][C] = "[R' D R, U2]";
bh_corners[G][D] = "[L D L', U']";
bh_corners[G][F] = "[y' L': [R' D' R, U2]]";
bh_corners[G][H] = "[z x': [U', R' D R]]";
bh_corners[G][I] = "[z R: [U2, R D R']]";
bh_corners[G][J] = "[D x: [R' D2 R, U]]";
bh_corners[G][K] = "[D, R U2 R']";
bh_corners[G][M] = "[x': [D2, R U' R']]";
bh_corners[G][N] = "[x: [R' U2 R, D']]";
bh_corners[G][O] = "[y': [R U' R', D2]]";
bh_corners[G][P] = "[L: [D2, R U' R']]";
bh_corners[G][Q] = "[R': [R' D R, U2]]";
bh_corners[G][S] = "[y': [R U' R', D]]";
bh_corners[G][T] = "[R' y: [R' D2 R, U]]";
bh_corners[G][V] = "[z' x': [D', R U2 R']]";
bh_corners[G][W] = "[R: [D, R U2 R']]";
bh_corners[G][X] = "[z' R: [R2 U R2 U' R2, D2]]";

bh_corners[H] = {};
bh_corners[H][B] = "[R D' R', U]";
bh_corners[H][C] = "[U2, L' D' L]";
bh_corners[H][D] = "[U, L' D' L]";
bh_corners[H][F] = "[y' R: [R D2 R', U2]]";
bh_corners[H][G] = "[z x': [R' D R, U']]";
bh_corners[H][I] = "[y': [U' R' U, L']]";
bh_corners[H][J] = "[x': [L D' L', U']]";
bh_corners[H][K] = "[x': [L D2 L', U']]";
bh_corners[H][L] = "[L U L', D']";
bh_corners[H][M] = "[x: [D, L' U2 L]]";
bh_corners[H][N] = "[L': [D, L' U2 L]]";
bh_corners[H][O] = "[R: [L U L', D2]]";
bh_corners[H][P] = "[L U L', D2]";
bh_corners[H][Q] = "[R': [U2, L' D' L]]";
bh_corners[H][T] = "[D', R' U R]";
bh_corners[H][U] = "[y' R': [D2, R' U2 R]]";
bh_corners[H][V] = "[y': [U' R2 U, L']]";
bh_corners[H][W] = "[L: [L D2 L', U']]";

bh_corners[I] = {};
bh_corners[I][B] = "[x: [L, U R' U']]";
bh_corners[I][C] = "[x R': [U2, R' D2 R]]";
bh_corners[I][G] = "[z R: [R D R', U2]]";
bh_corners[I][H] = "[y': [L', U' R' U]]";
bh_corners[I][J] = "[x' y': [R U R', D']]";
bh_corners[I][K] = "[x: [U2, R' D2 R]]";
bh_corners[I][L] = "[x' y': [R U R', D]]";
bh_corners[I][M] = "[x': [U' R U, L']]";
bh_corners[I][N] = "[U R U', L']";
bh_corners[I][O] = "[L, U' R2 U]";
bh_corners[I][P] = "[L, U' R U]";
bh_corners[I][Q] = "[x R2: [U2, R' D2 R]]";
bh_corners[I][S] = "[z R': [F, R' B2 R]]";
bh_corners[I][T] = "[U R' U', L']";
bh_corners[I][U] = "[y' R': [D, R' U2 R]]";
bh_corners[I][V] = "[U R2 U', L']";
bh_corners[I][W] = "[x: [R U2 R', D2]]";
bh_corners[I][X] = "[U': [L2, U' R' U]]";

bh_corners[J] = {};
bh_corners[J][B] = "[x' z: [D, R U R']]";
bh_corners[J][D] = "[L': [U2, L' D' L]]";
bh_corners[J][F] = "[y' R: [R D R', U2]]";
bh_corners[J][G] = "[D x: [U, R' D2 R]]";
bh_corners[J][H] = "[x': [U', L D' L']]";
bh_corners[J][I] = "[x' y': [D', R U R']]";
bh_corners[J][K] = "[x: [U, R' D2 R]]";
bh_corners[J][L] = "[x y': [U2, R' D R]]";
bh_corners[J][N] = "[x': [U, L D' L']]";
bh_corners[J][O] = "[D' x: [U, R' D2 R]]";
bh_corners[J][P] = "[z' L': [U2, R' D R]]";
bh_corners[J][Q] = "[R': [R' F' R2 F R, U2]]";
bh_corners[J][S] = "[x': [U R2 U', L']]";
bh_corners[J][T] = "[x: [U' L U, R2]]";
bh_corners[J][U] = "[z': [R U' R', D2]]";
bh_corners[J][V] = "[z': [U', R' D2 R]]";
bh_corners[J][W] = "[x': [U2, L D' L']]";
bh_corners[J][X] = "[z' R: [R U' R', D2]]";

bh_corners[K] = {};
bh_corners[K][B] = "[U', L' D2 L]";
bh_corners[K][C] = "[U2, L' D2 L]";
bh_corners[K][D] = "[U, L' D2 L]";
bh_corners[K][F] = "[y L: [U2, R D' R']]";
bh_corners[K][G] = "[R U2 R', D]";
bh_corners[K][H] = "[x: [D', L U2 L']]";
bh_corners[K][I] = "[x: [R' D2 R, U2]]";
bh_corners[K][J] = "[x: [R' D2 R, U]]";
bh_corners[K][L] = "[x: [R' D2 R, U']]";
bh_corners[K][M] = "[z' R: [R D' R', U2]]";
bh_corners[K][N] = "[x: [D, L U2 L']]";
bh_corners[K][O] = "[R U2 R', D']";
bh_corners[K][Q] = "[x' z: [D2, R2 U R2 U' R2]]";
bh_corners[K][S] = "[R U2 R', D2]";
bh_corners[K][T] = "[F: [D2, R' U R]]";
bh_corners[K][U] = "[z': [R2 U R2 U' R2, D2]]";
bh_corners[K][W] = "[x: [D2, L U2 L']]";
bh_corners[K][X] = "[U': [L2, U' R U]]";

bh_corners[L] = {};
bh_corners[L][B] = "[R D2 R', U]";
bh_corners[L][C] = "[y: [U2, R D' R']]";
bh_corners[L][D] = "[y': [R' D' R, U']]";
bh_corners[L][F] = "[x U R':  [U2, R' D2 R]]";
bh_corners[L][H] = "[D', L U L']";
bh_corners[L][I] = "[x' y': [D, R U R']]";
bh_corners[L][J] = "[x y': [R' D R, U2]]";
bh_corners[L][K] = "[x: [U', R' D2 R]]";
bh_corners[L][M] = "[D x: [U L2 U', R']]";
bh_corners[L][N] = "[x y: [R U2 R', D']]";
bh_corners[L][O] = "[F': [R U2 R', D']]";
bh_corners[L][P] = "[y': [D, R' U2 R]]";
bh_corners[L][Q] = "[x R2: [U', R' D2 R]]";
bh_corners[L][S] = "[F': [R U2 R', D2]]";
bh_corners[L][T] = "[D2, R' U R]";
bh_corners[L][V] = "[R': [D2, R' U R]]";
bh_corners[L][W] = "[x: [R U' R', D2]]";
bh_corners[L][X] = "[z'  R: [R U R', D2]]";

bh_corners[M] = {};
bh_corners[M][B] = "[y R: [U2, R D R']]";
bh_corners[M][D] = "[x': [R U' R', D]]";
bh_corners[M][F] = "[F: [R' F' R2 F R, U2]]";
bh_corners[M][G] = "[x': [R U' R', D2]]";
bh_corners[M][H] = "[x: [L' U2 L, D]]";
bh_corners[M][I] = "[x': [L', U' R U]]";
bh_corners[M][K] = "[z' R: [U2, R D' R']]";
bh_corners[M][L] = "[D x: [R', U L2 U']]";
bh_corners[M][N] = "[R': [F L2 F', R']]";
bh_corners[M][O] = "[R': [F L2 F', R2]]";
bh_corners[M][P] = "[R', F L2 F']";
bh_corners[M][Q] = "[R2: [D', R U2 R']]";
bh_corners[M][S] = "[x': [L, U' R U]]";
bh_corners[M][T] = "[D' x: [R', U L2 U']]";
bh_corners[M][U] = "[x': [L2, U' R U]]";
bh_corners[M][V] = "[z' x': [D, R U2 R']]";
bh_corners[M][W] = "[z' x': [R' D R, U2]]";
bh_corners[M][X] = "[D x': [L2, U' R U]]";

bh_corners[N] = {};
bh_corners[N][C] = "[z' y' R: [U2, R D2 R']]";
bh_corners[N][D] = "[x': [U', R' D R]]";
bh_corners[N][F] = "[x z R': [R' D2 R, U2]]";
bh_corners[N][G] = "[x: [D', R' U2 R]]";
bh_corners[N][H] = "[L': [L' U2 L, D]]";
bh_corners[N][I] = "[L', U R U']";
bh_corners[N][J] = "[x': [L D' L', U]]";
bh_corners[N][K] = "[x: [L U2 L', D]]";
bh_corners[N][L] = "[D: [U' L' U, R2]]";
bh_corners[N][M] = "[R': [R', F L2 F']]";
bh_corners[N][O] = "[U' L' U, R']";
bh_corners[N][P] = "[U' L' U, R2]";
bh_corners[N][S] = "[L, U R U']";
bh_corners[N][T] = "[x' y' R': [R' D' R, U2]]";
bh_corners[N][U] = "[L2, U R U']";
bh_corners[N][V] = "[y': [U' R2 U, L]]";
bh_corners[N][W] = "[R: [D', R U2 R']]";
bh_corners[N][X] = "[x' y' R: [U2, R D R']]";

bh_corners[O] = {};
bh_corners[O][B] = "[R D R', U]";
bh_corners[O][C] = "[U2, L' D L]";
bh_corners[O][D] = "[y': [R' D2 R, U']]";
bh_corners[O][F] = "[y' x R2: [D, R U2 R']]";
bh_corners[O][G] = "[y': [D2, R U' R']]";
bh_corners[O][H] = "[R: [D2, L U L']]";
bh_corners[O][I] = "[U' R2 U, L]";
bh_corners[O][J] = "[F: [D', R U2 R']]";
bh_corners[O][K] = "[D', R U2 R']";
bh_corners[O][L] = "[F': [D', R U2 R']]";
bh_corners[O][M] = "[R: [F L2 F', R2]]";
bh_corners[O][N] = "[R', U' L' U]";
bh_corners[O][P] = "[x: [R, U L2 U']]";
bh_corners[O][Q] = "[x R' U: [R2, U L2 U']]";
bh_corners[O][S] = "[D': [R U2 R', D']]";
bh_corners[O][U] = "[x: [U' R U, L2]]";
bh_corners[O][V] = "[y' R: [D2, R U' R']]";
bh_corners[O][X] = "[R D: [L2, U R' U']]";

bh_corners[P] = {};
bh_corners[P][B] = "[y: [U', R D2 R']]";
bh_corners[P][C] = "[R' D' R, U2]";
bh_corners[P][D] = "[L D' L', U']";
bh_corners[P][F] = "[x' y': [D2, R2 U R2 U' R2]]";
bh_corners[P][G] = "[L: [R U' R', D2]]";
bh_corners[P][H] = "[D2, L U L']";
bh_corners[P][I] = "[U' R U, L]";
bh_corners[P][J] = "[z' L': [R' D R, U2]]";
bh_corners[P][L] = "[y': [R' U2 R, D]]";
bh_corners[P][M] = "[F L2 F', R']";
bh_corners[P][N] = "[R2, U' L' U]";
bh_corners[P][O] = "[x: [U L2 U', R]]";
bh_corners[P][Q] = "[R': [U2, L' D L]]";
bh_corners[P][S] = "[x': [L, U' R2 U]]";
bh_corners[P][T] = "[D, R' U R]";
bh_corners[P][U] = "[x': [L2, U' R2 U]]";
bh_corners[P][W] = "[x: [R2 U R2 U' R2, D2]]";
bh_corners[P][X] = "[D: [L2, U R' U']]";

bh_corners[Q] = {};
bh_corners[Q][C] = "[R': [L' D2 L, U2]]";
bh_corners[Q][D] = "[R2: [U, L' D2 L]]";
bh_corners[Q][F] = "[R' F: [R' D' R, U2]]";
bh_corners[Q][G] = "[R': [U2, R' D R]]";
bh_corners[Q][H] = "[R': [L' D' L, U2]]";
bh_corners[Q][I] = "[x R: [D2, R U2 R']]";
bh_corners[Q][J] = "[R': [U2, R' F' R2 F R]]";
bh_corners[Q][K] = "[y x': [R2 U R2 U' R2, D2]]";
bh_corners[Q][L] = "[x R: [D2, R U' R']]";
bh_corners[Q][M] = "[R': [U2, R' D' R]]";
bh_corners[Q][O] = "[x R' U: [U L2 U', R2]]";
bh_corners[Q][P] = "[R': [L' D L, U2]]";
bh_corners[Q][S] = "[R': [U2, R' D2 R]]";
bh_corners[Q][T] = "[x R: [D2, R U R']]";
bh_corners[Q][U] = "[y x': [U2, R' F' R2 F R]]";
bh_corners[Q][V] = "[R2: [U', L' D2 L]]";
bh_corners[Q][W] = "[R2: [U2, L' D2 L]]";
bh_corners[Q][X] = "[U2 R: [R D' R', U2]]";

bh_corners[S] = {};
bh_corners[S][B] = "[y': [U', L D L']]";
bh_corners[S][C] = "[R' D2 R, U2]";
bh_corners[S][D] = "[y': [R' D R, U']]";
bh_corners[S][F] = "[y x' R: [U2, R D R']]";
bh_corners[S][G] = "[y': [D, R U' R']]";
bh_corners[S][I] = "[y x2 R: [U', R D2 R']]";
bh_corners[S][J] = "[x': [L', U R2 U']]";
bh_corners[S][K] = "[D2, R U2 R']";
bh_corners[S][L] = "[F': [D2, R U2 R']]";
bh_corners[S][M] = "[x': [U' R U, L]]";
bh_corners[S][N] = "[U R U', L]";
bh_corners[S][O] = "[D2: [R U2 R', D]]";
bh_corners[S][P] = "[x': [U' R2 U, L]]";
bh_corners[S][Q] = "[R2: [D2, R U2 R']]";
bh_corners[S][T] = "[U R' U', L]";
bh_corners[S][U] = "[y R': [R' D2 R, U]]";
bh_corners[S][V] = "[U R2 U', L]";
bh_corners[S][W] = "[R: [D2, R U2 R']]";

bh_corners[T] = {};
bh_corners[T][B] = "[y: [R' D' R, U]]";
bh_corners[T][C] = "[y': [R D' R', U2]]";
bh_corners[T][D] = "[L D2 L', U']";
bh_corners[T][F] = "[y' R: [R D' R', U2]]";
bh_corners[T][G] = "[R' y: [U, R' D2 R]]";
bh_corners[T][H] = "[R' U R, D']";
bh_corners[T][I] = "[L', U R' U']";
bh_corners[T][J] = "[x: [R2, U' L U]]";
bh_corners[T][K] = "[F: [R' U R, D2]]";
bh_corners[T][L] = "[R' U R, D2]";
bh_corners[T][M] = "[D' x: [U L2 U', R']]";
bh_corners[T][N] = "[x' y' R': [U2, R' D' R]]";
bh_corners[T][P] = "[R' U R, D]";
bh_corners[T][Q] = "[x R: [R U R', D2]]";
bh_corners[T][S] = "[L, U R' U']";
bh_corners[T][U] = "[y' R': [D', R' U2 R]]";
bh_corners[T][V] = "[z': [U, R' D2 R]]";
bh_corners[T][X] = "[D2 R': [D2, R' U R]]";

bh_corners[U] = {};
bh_corners[U][B] = "[z': [D2, R U2 R']]";
bh_corners[U][C] = "[D: [R' F' R2 F R, U2]]";
bh_corners[U][D] = "[z' x' R: [R U2 R', D2]]";
bh_corners[U][F] = "[x' y' U': [R2, U' L2 U]]";
bh_corners[U][H] = "[y' R': [R' U2 R, D2]]";
bh_corners[U][I] = "[z x' R: [U', R D2 R']]";
bh_corners[U][J] = "[z': [D2, R U' R']]";
bh_corners[U][K] = "[z': [D2, R2 U R2 U' R2]]";
bh_corners[U][M] = "[x': [U' R U, L2]]";
bh_corners[U][N] = "[U R U', L2]";
bh_corners[U][O] = "[x: [L2, U' R U]]";
bh_corners[U][P] = "[x': [U' R2 U, L2]]";
bh_corners[U][Q] = "[y x': [R' F' R2 F R, U2]]";
bh_corners[U][S] = "[y R': [U, R' D2 R]]";
bh_corners[U][T] = "[y' R': [R' U2 R, D']]";
bh_corners[U][V] = "[U R2 U', L2]";
bh_corners[U][W] = "[y' U': [R2 U R2 U' R2, D2]]";
bh_corners[U][X] = "[D: [L2, U R2 U']]";

bh_corners[V] = {};
bh_corners[V][B] = "[z': [R' D2 R, U2]]";
bh_corners[V][C] = "[R' F' R2 F R, U2]";
bh_corners[V][D] = "[x': [D2, L' U' L]]";
bh_corners[V][F] = "[F: [R' D R, U2]]";
bh_corners[V][G] = "[z' x': [R U2 R', D']]";
bh_corners[V][H] = "[y': [L', U' R2 U]]";
bh_corners[V][I] = "[L', U R2 U']";
bh_corners[V][J] = "[z': [R' D2 R, U']]";
bh_corners[V][L] = "[R2: [U, R D2 R']]";
bh_corners[V][M] = "[z' x': [R U2 R', D]]";
bh_corners[V][N] = "[y': [L, U' R2 U]]";
bh_corners[V][O] = "[y' R2: [U', R' D2 R]]";
bh_corners[V][Q] = "[R2: [L' D2 L, U']]";
bh_corners[V][S] = "[L, U R2 U']";
bh_corners[V][T] = "[z': [R' D2 R, U]]";
bh_corners[V][U] = "[L2, U R2 U']";
bh_corners[V][W] = "[D': [U R2 U', L2]]";
bh_corners[V][X] = "[U2: [R2 U R2 U' R2, D2]]";

bh_corners[W] = {};
bh_corners[W][B] = "[z' R': [R' D2 R, U2]]";
bh_corners[W][C] = "[D': [R' F' R2 F R, U2]]";
bh_corners[W][D] = "[x: [L U L', D2]]";
bh_corners[W][F] = "[x' y': [R' F' R2 F R, U2]]";
bh_corners[W][G] = "[R: [R U2 R', D]]";
bh_corners[W][H] = "[L: [U', L D2 L']]";
bh_corners[W][I] = "[x: [D2, R U2 R']]";
bh_corners[W][J] = "[x: [L U' L', D2]]";
bh_corners[W][K] = "[x: [L U2 L', D2]]";
bh_corners[W][L] = "[x: [D2, R U' R']]";
bh_corners[W][M] = "[z' x': [U2, R' D R]]";
bh_corners[W][N] = "[R: [R U2 R', D']]";
bh_corners[W][P] = "[x: [D2, R2 U R2 U' R2]]";
bh_corners[W][Q] = "[R2: [L' D2 L, U2]]";
bh_corners[W][S] = "[R: [R U2 R', D2]]";
bh_corners[W][U] = "[y' U': [D2, R2 U R2 U' R2]]";
bh_corners[W][V] = "[D': [L2, U R2 U']]";
bh_corners[W][X] = "[D2: [U R2 U', L2]]";

bh_corners[X] = {};
bh_corners[X][B] = "[z' R: [D2, R U2 R']]";
bh_corners[X][C] = "[D2: [R' F' R2 F R, U2]]";
bh_corners[X][D] = "[x' y R': [U2, R' D2 R]]";
bh_corners[X][F] = "[z R': [R' F' R2 F R, U2]]";
bh_corners[X][G] = "[z' R: [D2, R2 U R2 U' R2]]";
bh_corners[X][I] = "[U': [U' R' U, L2]]";
bh_corners[X][J] = "[z' R: [D2, R U' R']]";
bh_corners[X][K] = "[U': [U' R U, L2]]";
bh_corners[X][L] = "[z' R: [D2, R U R']]";
bh_corners[X][M] = "[D x': [U' R U, L2]]";
bh_corners[X][N] = "[x' y' R: [R D R', U2]]";
bh_corners[X][O] = "[R D: [U R' U', L2]]";
bh_corners[X][P] = "[D: [U R' U', L2]]";
bh_corners[X][Q] = "[U2 R: [U2, R D' R']]";
bh_corners[X][T] = "[D2 R': [R' U R, D2]]";
bh_corners[X][U] = "[D: [U R2 U', L2]]";
bh_corners[X][V] = "[U2: [D2, R2 U R2 U' R2]]";
bh_corners[X][W] = "[D2: [L2, U R2 U']]";

// Inits the canvas
function initCube() {
    // Full cube is initialized in the solved position
    for (var i=0; i<54; i++ ){
        full_cube[i] = 0;
    }
    full_cube[4]  = A;
    full_cube[13] = E;
    full_cube[22] = I;
    full_cube[31] = M;
    full_cube[40] = Q;
    full_cube[49] = U;

    // Sticker arrays are initialized in solved position
    resetCube();
}

// Inits canvas to draw the cube
function initCubeCanvas(canvas_id){
    cube_canvas = document.getElementById('cube_canvas').getContext('2d');
}

// Sets cube to solved position
function resetCube(){
    // Corners and edges are initialized in solved position
    for (var i=0; i<24; i++ ){
        corners[i] = i;
        edges[i]   = i;
    }

    // Centers are initialized in the solved position
    centers[0] = A;
    centers[1] = E;
    centers[2] = I;
    centers[3] = M;
    centers[4] = Q;
    centers[5] = U;
}

// Renders cube in current position
function renderCube(){
    // full_cube array is constructed based on corners, edges and centers
    for (var i=0; i<24; i++ ){
        full_cube[corners_to_full[i]] = corners[i];
        full_cube[edges_to_full[i]]   = edges[i];
    }
    for (var i=0; i<6; i++ ){
        full_cube[centers_to_full[i]] = centers[i];
    }

    // Position in full_cube array
    var sticker_position = 0;

    // Starting position
    var x = 10;
    var y = 70;

    // U Face
    x += 150;
    y -= 60;
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*30) - (j*20), y + (j*20));
            cube_canvas.lineTo(x + 30 + (i*30) - (j*20), y + (j*20));
            cube_canvas.lineTo(x + 10 + (i*30) - (j*20), y + 20 + (j*20));
            cube_canvas.lineTo(x - 20 + (i*30) - (j*20), y + 20 + (j*20));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }

    // L Face
    x -= 150;
    y += 60;
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + 30 + (j*30));
            cube_canvas.lineTo(x + (i*30), y + 30 + (j*30));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }

    // F Face
    x += 90;
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + 30 + (j*30));
            cube_canvas.lineTo(x + (i*30), y + 30 + (j*30));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }

    // R Face
    x += 90;
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*20), y - (i*20) + (j*30));
            cube_canvas.lineTo(x + 20 + (i*20), y - 20 - (i*20) + (j*30));
            cube_canvas.lineTo(x + 20 + (i*20), y + 10 - (i*20) + (j*30));
            cube_canvas.lineTo(x + (i*20), y + 30 - (i*20) + (j*30));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }

    // B Face
    y -= 60;
    x += 60
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + 30 + (j*30));
            cube_canvas.lineTo(x + (i*30), y + 30 + (j*30));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }

    // D Face
    y += 150;
    x -= 150;
    for ( var i=0; i<3; i++){
        for ( var j=0; j<3; j++){
            cube_canvas.fillStyle = getColorFromSpeffz(full_cube[sticker_position++]);
            cube_canvas.beginPath();
            cube_canvas.moveTo(x + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + (j*30));
            cube_canvas.lineTo(x + 30 + (i*30), y + 30 + (j*30));
            cube_canvas.lineTo(x + (i*30), y + 30 + (j*30));
            cube_canvas.closePath();
            cube_canvas.fill();
            cube_canvas.stroke();
        }
    }
}

// Perform a permutation on the cube
function permute ( permutation ){
    var exchanges = [Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z];
    // Corners are permuted
    var perm = permutations[permutation][CORNERS];
    for (var i=0; i<24; i++){
        if ( perm[i] != Z ){
            exchanges[perm[i]] = corners[i];
        }
    }
    for (var i=0; i<24; i++){
        if ( exchanges[i] != Z ){
            corners[i] = exchanges[i];
        }
    }

    // Edges are permuted
    exchanges = [Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z,Z];
    perm = permutations[permutation][EDGES];
    for (var i=0; i<24; i++){
        if ( perm[i] != Z ){
            exchanges[perm[i]] = edges[i];
        }
    }
    for (var i=0; i<24; i++){
        if ( exchanges[i] != Z ){
            edges[i] = exchanges[i];
        }
    }

    // Centers are permuted
    exchanges = [Z,Z,Z,Z,Z,Z];
    perm = permutations[permutation][CENTERS];
    for (var i=0; i<6; i++){
        if ( perm[i] != Z ){
            exchanges[perm[i]] = centers[i];
        }
    }
    for (var i=0; i<6; i++){
        if ( exchanges[i] != Z ){
            centers[i] = exchanges[i];
        }
    }
}

// Returns sticker color of the received position
function getColorFromSpeffz(position){
    var color_index = 0;
    for ( var i=1; i<6; i++ ){
        if ( position >= i*4 ){
            color_index = i;
        }
        else {
            break;
        }
    }
    return colors[color_index];
}

var targets = [];

// Sets the cube to solved state and applies scramble
function scrambleCube(scramble_str){
    resetCube();

    // unrecognized moves are ignored
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

    // Permutations are applied to the solved cube
    for (var i=0; i<permutations.length; i++ ){
        permute(permutations[i]);
    }

    // Corners and edges are set as unsolved
    for (var i=0; i<8; i++){
        solved_corners[i] = false;
    }
    for (var i=0; i<12; i++){
        solved_edges[i] = false;
    }

    computeStickerTargets();
}

// Precompute target letters for all stickers
function computeStickerTargets() {
    // Corners
    for (let loc = 0; loc < 24; loc++) {
        let sticker = corners[loc]; // which sticker is here
        let solved_letter = sticker; // in solved state, sticker maps to its index
        let full_index = corners_to_full[loc]; // map to full_cube index
        sticker_targets[full_index] = solved_letter;
    }

    // Edges
    for (let loc = 0; loc < 24; loc++) {
        let sticker = edges[loc];
        let solved_letter = sticker;
        let full_index = edges_to_full[loc];
        sticker_targets[full_index] = solved_letter;
    }

    // Centers
    for (let loc = 0; loc < 6; loc++) {
        let sticker = centers[loc];
        let solved_letter = sticker;
        let full_index = centers_to_full[loc];
        sticker_targets[full_index] = solved_letter;
    }
}

// Finds a BLD solution for the cube in its current state
function solveCube(){
    orientCube();
    solveCorners();
    solveEdges();
}

// Changes the solving orientation of the cube
function changeOrientation (permutation){
    // Colors are permuted
    exchanges = [Z,Z,Z,Z,Z,Z];
    perm = permutations[permutation][CENTERS];
    for (var i=0; i<6; i++){
        if ( perm[i] != Z ){
            exchanges[perm[i]] = colors[i];
        }
    }
    for (var i=0; i<6; i++){
        if ( exchanges[i] != Z ){
            colors[i] = exchanges[i];
        }
    }
}

// Rotates the cube into the solving orientation
function orientCube(){
    rotations = [];

    // Position of the top center is found
    var top_position = 0;
    for (var i=0; i<6 ; i++){
        if ( centers[i] == A ){
            top_position = i;
            break;
        }
    }

    // Cube is rotated to place the top orientation center in the U face
    switch ( top_position ){
        case 1: permute("z");  rotations.push("z");  break;
        case 2: permute("x");  rotations.push("x");  break;
        case 3: permute("z'"); rotations.push("z'"); break;
        case 4: permute("x'"); rotations.push("x'"); break;
        case 5:
            if ( centers[2] == I ) {
                permute("z2");
                rotations.push("z2");
            }
            else {
                permute("x2");
                rotations.push("x2");
            }
            break;
    }

    // Position of the front center is found
    var front_position = 0;
    for (var i=1; i<5 ; i++){
        if ( centers[i] == I ){
            front_position = i;
            break;
        }
    }

    // Cube is rotated to place the front orientation center in the F face
    switch ( front_position ){
        case 1: permute("y'"); rotations.push("y'"); break;
        case 3: permute("y");  rotations.push("y");  break;
        case 4: permute("y2"); rotations.push("y2"); break;
    }
}

// Solves all 8 corners in the cube
// Ignores miss-oriented corners
function solveCorners(){
    corner_cycles = [];
    cw_corners    = [];
    ccw_corners   = [];
    while ( !cornersSolved() ){
        cycleCornerBuffer();
    }
}

// Replaces the corner buffer with another corner
function cycleCornerBuffer(){
    var corner_cycled = false;

    var BC = corner_buffer_locs[corner_buffer];

    // If the buffer is solved, replace it with an unsolved corner
    if ( solved_corners[BC] ){
        // First unsolved corner is selected
        for (var i=1; i<8 && !corner_cycled; i++){
            if ( !solved_corners[i] ){
                // Buffer is placed in a... um... buffer
                var temp_corner = [corners[corner_cubies[BC][0]], corners[corner_cubies[BC][1]], corners[corner_cubies[BC][2]]];

                // Buffer corner is replaced with corner
                corners[corner_cubies[BC][0]] = corners[corner_cubies[i][0]];
                corners[corner_cubies[BC][1]] = corners[corner_cubies[i][1]];
                corners[corner_cubies[BC][2]] = corners[corner_cubies[i][2]];

                // Corner is replaced with buffer
                corners[corner_cubies[i][0]] = temp_corner[0];
                corners[corner_cubies[i][1]] = temp_corner[1];
                corners[corner_cubies[i][2]] = temp_corner[2];
                
                // Phantom target
                corner_cycles.push(-sticker_targets[corners_to_full[
                    corner_cycles.length > 0 
                        ? corner_cycles[corner_cycles.length - 1] 
                        : corner_buffer
                ]] - 1);
                // Corner cycle is inserted into solution array
                corner_cycles.push( corner_cubies[i][0] );
                corner_cycled = true;
            }
        }
    }
    // If the buffer is not solved, swap it to the position where the corner belongs
    else {
        for (var i=0; i<8 && !corner_cycled; i++){
            for (var j=0; j<3 && !corner_cycled; j++){
                if ( corners[corner_cubies[BC][0]] == corner_cubies[i][j%3] && corners[corner_cubies[BC][1]] == corner_cubies[i][(j+1)%3] && corners[corner_cubies[BC][2]] == corner_cubies[i][(j+2)%3] ){
                    // Buffer corner is replaced with corner
                    corners[corner_cubies[BC][0]] = corners[corner_cubies[i][j%3]];
                    corners[corner_cubies[BC][1]] = corners[corner_cubies[i][(j+1)%3]];
                    corners[corner_cubies[BC][2]] = corners[corner_cubies[i][(j+2)%3]];

                    // Corner is solved
                    corners[corner_cubies[i][0]] = corner_cubies[i][0];
                    corners[corner_cubies[i][1]] = corner_cubies[i][1];
                    corners[corner_cubies[i][2]] = corner_cubies[i][2];

                    // Corner cycle is inserted into solution array
                    corner_cycles.push( corner_cubies[i][j%3] );
                    corner_cycled = true;
                }
            }
        }
    }
}

// Checks if all 8 corners are already solved
function cornersSolved (){
    var corners_solved = true;

    var BC = corner_buffer_locs[corner_buffer];

    // Check if corners marked as unsolved haven't been solved yet
    for (var i=0; i<8; i++){
        if ( i==BC || !solved_corners[i] ){
            // Corner is solved and oriented
            if ( corners[corner_cubies[i][0]] == corner_cubies[i][0] && corners[corner_cubies[i][1]] == corner_cubies[i][1] && corners[corner_cubies[i][2]] == corner_cubies[i][2] ) {
                solved_corners[i] = true;
            }
            // Corner is in correct position but needs to be rotated clockwise
            else if ( corners[corner_cubies[i][0]] == corner_cubies[i][1] && corners[corner_cubies[i][1]] == corner_cubies[i][2] && corners[corner_cubies[i][2]] == corner_cubies[i][0] ){
                solved_corners[i] = true;
                if ( i != BC ){
                    cw_corners.push(corner_cubies[i][0]);
                }
            }
            // Corner is in correct position but needs to be rotated counter-clockwise
            else if ( corners[corner_cubies[i][0]] == corner_cubies[i][2] && corners[corner_cubies[i][1]] == corner_cubies[i][0] && corners[corner_cubies[i][2]] == corner_cubies[i][1] ){
                solved_corners[i] = true;
                if ( i != BC ){
                    ccw_corners.push(corner_cubies[i][0]);
                }
            }
            else {
                // Found at least one unsolved corner
                solved_corners[i] = false;
                corners_solved = false;
            }
        }
    }

    return corners_solved;
}

// Solves all 12 edges in the cube
function solveEdges(){
    edge_cycles = [];
    flipped_edges = [];

    // Parity is solved by swapping UL and UB
    if ( pseudo_swap && corner_cycles.length%2 == 1 ){
        var UB = -1;
        var UL = -1;

        // Positions of UB and UL edges are found
        for (var i=0; i<12 && (UB == -1 || UL == -1); i++){
            if ( (edges[edge_cubies[i][0]] == A && edges[edge_cubies[i][1]] == Q) || (edges[edge_cubies[i][1]] == A && edges[edge_cubies[i][0]] == Q) ){
                UB = i;
            }
            if ( (edges[edge_cubies[i][0]] == D && edges[edge_cubies[i][1]] == E) || (edges[edge_cubies[i][1]] == D && edges[edge_cubies[i][0]] == E) ){
                UL = i;
            }
        }

        // UB is stored in buffer
        var temp_edge = [edges[edge_cubies[UB][0]],edges[edge_cubies[UB][1]]];

        // Make sure that A goes to D and Q goes to E
        var index = 0;
        if ( (edges[edge_cubies[UB][0]] == A && edges[edge_cubies[UL][0]] == E) || (edges[edge_cubies[UB][0]] == Q && edges[edge_cubies[UL][0]] == D) ){
            index = 1;
        }

        // UL is placed in UB
        edges[edge_cubies[UB][0]] = edges[edge_cubies[UL][index]];
        edges[edge_cubies[UB][1]] = edges[edge_cubies[UL][(index+1)%2]];

        // buffer is placed in UL
        edges[edge_cubies[UL][0]] = temp_edge[index];
        edges[edge_cubies[UL][1]] = temp_edge[(index+1)%2];
    }

    while ( !edgesSolved() ){
        cycleEdgeBuffer();
    }
}

// Buffer cubie number, uses first sticked of the cubie
// Replaces the edge buffer with another edge
function cycleEdgeBuffer(){
    var edge_cycled = false;

    // Index of the cubie of the edge buffer (in edge_cubies array)
    var BC = edge_buffer_locs[edge_buffer];

    // If the buffer is solved, replace it with an unsolved edge
    if ( solved_edges[BC] ){
        // First unsolved edge is selected
        for (var i=0;  i<12 && !edge_cycled; i++){
            if ( !solved_edges[i] && i !== BC ){
                // Buffer is placed in a... um... buffer
                var temp_edge = [edges[edge_cubies[BC][0]], edges[edge_cubies[BC][1]]];

                // Buffer edge is replaced with edge
                edges[edge_cubies[BC][0]] = edges[edge_cubies[i][0]];
                edges[edge_cubies[BC][1]] = edges[edge_cubies[i][1]];

                // Edge is replaced with buffer
                edges[edge_cubies[i][0]] = temp_edge[0];
                edges[edge_cubies[i][1]] = temp_edge[1];

                // Phantom target
                edge_cycles.push(-sticker_targets[edges_to_full[
                    edge_cycles.length > 0 
                        ? edge_cycles[edge_cycles.length - 1] 
                        : edge_buffer
                ]] - 1);
                // Edge cycle is inserted into solution array
                edge_cycles.push( edge_cubies[i][0] );
                edge_cycled = true;
            }
        }
    }
    // If the buffer is not solved, swap it to the position where the edge belongs
    else {
        for (var i=0; i<12 && !edge_cycled; i++){
            for (var j=0; j<2 && !edge_cycled; j++){
                if ( edges[edge_cubies[BC][0]] == edge_cubies[i][j%2] && edges[edge_cubies[BC][1]] == edge_cubies[i][(j+1)%2] ){
                    // Buffer edge is replaced with edge
                    edges[edge_cubies[BC][0]] = edges[edge_cubies[i][j%2]];
                    edges[edge_cubies[BC][1]] = edges[edge_cubies[i][(j+1)%2]];

                    // Edge is solved
                    edges[edge_cubies[i][0]] = edge_cubies[i][0];
                    edges[edge_cubies[i][1]] = edge_cubies[i][1];

                    // Edge cycle is inserted into solution array
                    edge_cycles.push( edge_cubies[i][j%2] );
                    edge_cycled = true;
                }
            }
        }
    }
}

// Checks if all 12 edges are already solved
// Ignores orientation
function edgesSolved (){
    var edges_solved = true;

    // Index of the cubie of the edge buffer (in edge_cubies array)
    var BC = edge_buffer_locs[edge_buffer];


    // Check if edges marked as unsolved haven't been solved yet
    for (var i=0; i<12; i++){
        if ( i==BC || !solved_edges[i] ){
            // Edge is solved in correct orientation
            if ( edges[edge_cubies[i][0]] == edge_cubies[i][0] && edges[edge_cubies[i][1]] == edge_cubies[i][1] ) {
                solved_edges[i] = true;
            }
            // Edge is solved but miss-oriented
            else if ( edges[edge_cubies[i][0]] == edge_cubies[i][1] && edges[edge_cubies[i][1]] == edge_cubies[i][0] ){
                solved_edges[i] = true;
                if (i != BC){
                    flipped_edges.push(edge_cubies[i][0]);
                }
            }
            else {
                // Found at least one unsolved edge
                solved_edges[i] = false;
                edges_solved = false;
            }
        }
    }

    return edges_solved;
}