
export class Fretboard {
  constructor(container, tuning, noteSystem, harmonica) {
    this.container = container;
    this.tuning = tuning;
    this.noteSystem = noteSystem;
    this.harmonica = harmonica;
    this.numOfFrets = 18;
    this.pressedNotes = [];

    this.theme = 'mahogany'; // default
    this.customColor = '#4b2e2e';

  }

  setTheme(theme, customColor = null) {
    this.theme = theme;
    if (customColor) this.customColor = customColor;
    this.render();
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

      if (this.theme === 'custom') {
        cell.style.backgroundColor = this.customColor;
        cell.style.color = '#fff';
      } else {
        cell.classList.add(`fret-${this.theme}`);
      }


      //cell.classList.add("fretField");
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
      // if (playable) {
      //   cell.addEventListener('click', () => this.noteClick(stringIndex, fret, searchNote));
      // } else {
      //   cell.classList.add("disabledNote");
      //   cell.classList.remove("fretField");
      // }

      if (playable) {
        cell.addEventListener('click', () => this.noteClick(stringIndex, fret, searchNote));
        cell.classList.add("fretField");
      } else {
        if (this.theme === 'custom') {
            // disabled → bledja nijansa
            const lighter = lightenColor(this.customColor, 0.3);
            cell.style.backgroundColor = lighter;
            cell.style.color = '#aaa';
            cell.style.pointerEvents = 'none'; // da ne reaguje na hover/klik
          
        } else {
          cell.classList.add(playable ? `fret-${this.theme}` : `fret-${this.theme}-disabled`);
        }
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
    numCell.classList.add('numeration');
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


function lightenColor(hex, percent) {
  // skini # ako postoji
  hex = hex.replace(/^#/, '');

  // parsiraj u R, G, B
  let r = parseInt(hex.substring(0,2), 16);
  let g = parseInt(hex.substring(2,4), 16);
  let b = parseInt(hex.substring(4,6), 16);

  // pomeri svaku komponentu ka 255 (belo)
  r = Math.min(255, Math.floor(r + (255 - r) * percent));
  g = Math.min(255, Math.floor(g + (255 - g) * percent));
  b = Math.min(255, Math.floor(b + (255 - b) * percent));

  // vrati nazad kao hex string
  return "#" + r.toString(16).padStart(2,'0')
             + g.toString(16).padStart(2,'0')
             + b.toString(16).padStart(2,'0');
}