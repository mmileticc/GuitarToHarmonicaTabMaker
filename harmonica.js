// Mapiranje nota na semitonove (MIDI stil ali bez oktava)
const NOTE_TO_SEMITONE = {
  "C": 0, "C#": 1, "Db": 1,
  "D": 2, "D#": 3, "Eb": 3,
  "E": 4,
  "F": 5, "F#": 6, "Gb": 6,
  "G": 7, "G#": 8, "Ab": 8,
  "A": 9, "A#": 10, "Bb": 10,
  "B": 11
};

// Obrnuto mapiranje
const SEMITONE_TO_NOTE = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B"
];
const ROOT_MIDI = {
    "G": 43,  // G2
    "A": 45,  // A2
    "C": 48,  // C3 
    "D": 50,  // D3
    "F": 53,   // F3
    
    /*"G": 43,   // G2
    "A": 45,   // A2
    "Bb": 46,  // Bb2
    "B": 47,   // B2
    "C": 48,   // C3
    "Db": 49,  // Db3
    "D": 50,   // D3
    "Eb": 51,  // Eb3
    "E": 52,   // E3
    "F": 53,   // F3
    "F#": 54,  // F#3
    "Ab": 56   // Ab3*/

};

export class DiatonicHarmonica {
  constructor(key = "C") {
    this.key = key;
    this.root = NOTE_TO_SEMITONE[key];
    this.rootMidi = ROOT_MIDI[key];


    // Standardni raspored diatonske harmonike (Richter)
    // Svaki element: { tab, semitoneOffset }
    // semitoneOffset je relativan u odnosu na tonalitet (root)
    this.layout = [
        // Hole 1
        { tab: "1",  offset: 0 },     // C
        { tab: "-1", offset: 2 },     // D
        //{ tab: "-1/", offset: 1 },    // Db (bend)

        // Hole 2
        { tab: "2",   offset: 4 },   // E
        { tab: "-2",  offset: 7 },   // G
        //{ tab: "-2/", offset: 6 },   // F# (1/2 step bend)
        //{ tab: "-2//",offset: 5 },   // F (1 step bend)

        // Hole 3
        { tab: "3",   offset: 7 },   // G
        { tab: "-3",  offset: 11 },  // B
        //{ tab: "-3/", offset: 10 },  // Bb (1/2 step bend)
        //{ tab: "-3//",offset: 9 },   // A  (1 step bend)

        // Hole 4
        { tab: "4",  offset: 12 },  // C
        { tab: "-4", offset: 14 },  // D
        //{ tab: "-4/", offset: 13 },  // Db

        // Hole 5
        { tab: "5",  offset: 16 },  // E
        { tab: "-5", offset: 17 },  // F

        // Hole 6
        { tab: "6",   offset: 19 }, // G
        { tab: "-6",  offset: 21 }, // A
        //{ tab: "-6/",  offset: 20 }, // G# (1/2 step bend)

        // Hole 7
        { tab: "7",  offset: 24 },  // C
        { tab: "-7", offset: 23 },  // B

        // Hole 8
        { tab: "8",  offset: 28 },  // E
        { tab: "-8", offset: 26 },  // D

        // Hole 9
        { tab: "9",  offset: 31 },  // G
        { tab: "-9", offset: 29 },  // F 

        // Hole 10
        { tab: "10",   offset: 36 }, // C
        { tab: "-10",  offset: 33 }, // A
        //{ tab: "-10/", offset: 32 }, // G# (bend)
        //{ tab: "-10//",offset: 31 }  // G (deep bend)
        ];
    }
    

 
    semitoneToNoteWithOctave(abs) {
        const noteName = SEMITONE_TO_NOTE[(abs % 12 + 12) % 12];
        const octave = Math.floor(abs / 12) - 1; 
        return noteName + octave;
    }

    /** Vraca listu objekata { note, tab } za trenutni kljuc harmonike */
    getPlayableNotes() {
        return this.layout.map(entry => {
            const absolute = this.rootMidi + entry.offset;
            const note = this.semitoneToNoteWithOctave(absolute);
            return { note, tab: entry.tab };
        });
    }

    /** Menja tonalitet (npr "G") i automatski transponuje note */
    setKey(newKey) {
        this.key = newKey;
        this.root = NOTE_TO_SEMITONE[newKey];
        this.rootMidi = ROOT_MIDI[newKey];

    }

}
