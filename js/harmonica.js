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
// const ROOT_MIDI = {
//     "G": 43,  // G2
//     "A": 45,  // A2
//     "C": 48,  // C3 
//     "D": 50,  // D3
//     "F": 53,   // F3
    
//     /*"G": 43,   // G2
//     "A": 45,   // A2
//     "Bb": 46,  // Bb2
//     "B": 47,   // B2
//     "C": 48,   // C3
//     "Db": 49,  // Db3
//     "D": 50,   // D3
//     "Eb": 51,  // Eb3
//     "E": 52,   // E3
//     "F": 53,   // F3
//     "F#": 54,  // F#3
//     "Ab": 56   // Ab3*/

// };
const ROOT_MIDI = {
  "G": 43, "Ab": 44, "A": 45, "Bb": 46, "B": 47,
  "C": 48, "Db": 49, "D": 50, "Eb": 51, "E": 52,
  "F": 53, "F#": 54
};

export class DiatonicHarmonica {
  constructor(key = "C") {
    this.key = key;
    this.rootMidi = ROOT_MIDI[key];

    // Advanced mode flag: when true, additional notes (bends, overblows) become playable
    this.advanced = false;


    // Standardni raspored diatonske harmonike (Richter)
    // Svaki element: { tab, semitoneOffset }
    // semitoneOffset je relativan u odnosu na tonalitet (root)
    this.layout = [
        // Hole 1
        { tab: "1",  offset: 0 },     // C
        { tab: "-1", offset: 2 },     // D
        { tab: "-1/", offset: 1, advanced: true, type: 'bend' },    // Db (bend)

        // Hole 2
        { tab: "2",   offset: 4 },   // E
        { tab: "-2",  offset: 7 },   // G
        { tab: "-2/", offset: 6, advanced: true, type: 'bend' },   // F# (1/2 step bend)
        { tab: "-2//",offset: 5, advanced: true, type: 'bend' },   // F (1 step bend)

        // Hole 3
        { tab: "3",   offset: 7 },   // G
        { tab: "-3",  offset: 11 },  // B
        { tab: "-3/", offset: 10, advanced: true, type: 'bend' },  // Bb (1/2 step bend)
        { tab: "-3//",offset: 9, advanced: true, type: 'bend' },   // A  (1 step bend)

        // Hole 4
        { tab: "4",  offset: 12 },  // C
        { tab: "-4", offset: 14 },  // D
        { tab: "-4/", offset: 13, advanced: true, type: 'bend' },  // Db

        // Hole 5
        { tab: "5",  offset: 16 },  // E
        { tab: "-5", offset: 17 },  // F

        // Hole 6
        { tab: "6",   offset: 19 }, // G
        { tab: "-6",  offset: 21 }, // A
        { tab: "-6/",  offset: 20, advanced: true, type: 'bend' }, // G# (1/2 step bend)

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
        { tab: "-10/", offset: 32, advanced: true, type: 'bend' }, // G# (bend)
        { tab: "-10//",offset: 31, advanced: true, type: 'bend' }  // G (deep bend)
        ];
    }
    

 
    semitoneToNoteWithOctave(abs) {
        const noteName = SEMITONE_TO_NOTE[(abs % 12 + 12) % 12];
        const octave = Math.floor(abs / 12) - 1; 
        return noteName + octave;
    }

    /** Vraca listu objekata { note, tab } za trenutni kljuc harmonike */
    getPlayableNotes() {
      // Include advanced entries only when enabled
      return this.layout
        .filter(entry => !entry.advanced || (entry.advanced && this.advanced))
        .map(entry => {
          const absolute = this.rootMidi + entry.offset;
          const note = this.semitoneToNoteWithOctave(absolute);
          return { note, tab: entry.tab, advanced: !!entry.advanced, type: entry.type || null };
        });
    }

    /** Menja tonalitet (npr "G") i automatski transponuje note */
    setKey(newKey) {
        this.key = newKey;
        this.rootMidi = ROOT_MIDI[newKey];

    }

    /** Enable or disable advanced mode (bends / overblows). Dispatches event. */
    setAdvancedMode(enabled) {
      this.advanced = !!enabled;
      // notify others so UI can update (fretboard, etc.)
      document.dispatchEvent(new CustomEvent('harmonicaAdvancedChange', { detail: { advanced: this.advanced } }));
    }

}
