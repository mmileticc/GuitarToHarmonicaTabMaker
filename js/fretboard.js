
export class Fretboard {
  constructor(container, tuning, noteSystem, harmonica) {
    this.container = container;
    this.tuning = tuning;
    this.noteSystem = noteSystem;
    this.harmonica = harmonica;
    this.numOfFrets = 18;
    this.pressedNotes = [];
  }

  render() {
  this.container.innerHTML = '';
  const table = document.createElement('table');
  const notesHarmonica = this.harmonica.getPlayableNotes();

  this.tuning.forEach((noteFull, stringIndex) => {
    const octave = parseInt(noteFull.slice(-1), 10);
    const noteName = noteFull.slice(0, -1);
    const rootIndex = this.noteSystem.findIndex(noteName);

    const stringRow = document.createElement('tr');

    for (let fret = 0; fret <= this.numOfFrets; fret++) {
      const cell = document.createElement('td');
      cell.classList.add("fretField");
      if (fret === 0) cell.classList.add('zeroFret');

      let idx = (rootIndex + fret) % this.noteSystem.notes.length;
      let octaveDiff = Math.floor((rootIndex + fret) / this.noteSystem.notes.length);
      let fullNote = this.noteSystem.notes[idx] + (octave + octaveDiff);

      let searchNote = fullNote;
      if (!this.noteSystem.isSharp) {
        searchNote = this.noteSystem.notesSharp[idx] + (octave + octaveDiff);
      }

      cell.textContent = fullNote;

      const playable = notesHarmonica.find(n => n.note === searchNote);
      if (playable) {
        cell.addEventListener('click', () => this.noteClick(stringIndex, fret, searchNote));
      } else {
        cell.classList.add("disabledNote");
        cell.classList.remove("fretField");
      }

      stringRow.append(cell);
    }
    table.append(stringRow);
  });

  // ➕ Dodaj numeraciju pragova ispod svih žica
  const numerationRow = document.createElement('tr');
  for (let fret = 0; fret <= this.numOfFrets; fret++) {
    const numCell = document.createElement('td');
    numCell.classList.add('tdNoBorder');
    numCell.textContent = fret;
    if ([3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(fret)) {
      numCell.classList.add('boldNumeration');
    }
    numerationRow.append(numCell);
  }
  table.append(numerationRow);

  this.container.append(table);
}

  noteClick(string, fret, note) {
    this.pressedNotes.push({ string, fret, note });
    document.dispatchEvent(new CustomEvent('notePressed', { detail: { string, fret, note } }));
  }

  setNumOfFrets(n) {
    this.numOfFrets = n;
    this.render();
  }
}