import { TabNote } from './tabNote.js';

export class TabManager {
  constructor(guitarDiv, harmonicaDiv, harmonica, tuning, fretboard) {
    this.guitarDiv = guitarDiv;
    this.harmonicaDiv = harmonicaDiv;
    this.harmonica = harmonica;
    this.tuning = tuning;

    this.fretboard = fretboard
    this.inputBuffer = ''; // privremeni unos sa tastature

    this.notes = [];            // centralni model tabova
    this.selectedIndex = null;  // koja nota je selektovana

    this.listen();
  }

  // ➕ Insert na određenu poziciju
  insertNote(string, fret, position, note) {
  const tabNote = new TabNote(string, fret, position, note);
  this.notes.splice(position, 0, tabNote);

  // reindeksiraj sve
  this.notes.forEach((n, i) => n.position = i);

  this.refresh();
  //this.refreshHarmonicaTabs();
}
  

  // Brisanje note po poziciji
  deleteNote(position) {
    this.notes = this.notes.filter(n => n.position !== position);
    this.refresh();
  }

  // Editovanje note po poziciji
  editNote(position, newFret) {
    const note = this.notes.find(n => n.position === position);
    if (note) {
      note.fret = newFret;

      // ➕ izračunaj novi pitch
      const openNote = this.tuning[note.string]; // npr. "E4"
      const octave = parseInt(openNote.slice(-1), 10);
      const noteName = openNote.slice(0, -1);
      const rootIndex = this.fretboard.noteSystem.findIndex(noteName);

      let idx = (rootIndex + newFret) % this.fretboard.noteSystem.notes.length;
      let octaveDiff = Math.floor((rootIndex + newFret) / this.fretboard.noteSystem.notes.length);
      note.note = this.fretboard.noteSystem.notes[idx] + (octave + octaveDiff);



      this.refresh();
    }
  }

  // Brisanje celog zapisa
  clearAll() {
    this.notes = [];
    this.selectedIndex = null;
    this.refresh();
  }

  // Brisanje selektovane note
  deleteSelected() {
    if (this.selectedIndex !== null) {
      this.deleteNote(this.selectedIndex);
      this.selectedIndex = null;
    }
  }

  // Editovanje selektovane note
  editSelected(newFret) {
    if (this.selectedIndex !== null) {
      this.editNote(this.selectedIndex, newFret);
      //this.refresh();///////////////////////////////////////////////////////////////////////////////////

    }
  }

  // Renderovanje
  refresh() {
    this.guitarDiv.innerHTML = '';
    const openLabels = this.tuning.map(note => note.padEnd(4, ' ') + '|');

    // grupisanje po stringovima
    const lines = Array(this.tuning.length).fill('').map((_, i) => openLabels[i]);

    this.notes.forEach(note => {
      for (let i = 0; i < lines.length; i++) {
        if (i === note.string) {
          const isSelected = (note.position === this.selectedIndex);
          const cssClass = isSelected ? 'tab-note selected' : 'tab-note';
          lines[i] += `<span class="${cssClass}" data-pos="${note.position}">${note.fret.toString().padStart(2,'-')}</span>-`;
        } else {
          lines[i] += '--' + '-';
        }
      }
    });

    lines.forEach(line => {
      const pre = document.createElement('pre');
      pre.innerHTML = line;
      this.guitarDiv.append(pre);
    });

    // dodaj klik listenere na note
    this.guitarDiv.querySelectorAll('.tab-note').forEach(el => {
      el.addEventListener('click', () => {
        // resetuj prethodnu selekciju
        this.guitarDiv.querySelectorAll('.tab-note.selected').forEach(sel => sel.classList.remove('selected'));
        let temp = parseInt(el.dataset.pos, 10);
        if(temp != this.selectedIndex){
          this.selectedIndex = temp;
          this.inputBuffer = '';
          el.classList.add('selected'); // vizuelno označi

        }
        //this.selectedIndex = parseInt(el.dataset.pos, 10);
      });
    });
    this.refreshHarmonicaTabs();

  }

  // sluša događaje sa fretboarda
  listen() {
    document.addEventListener('notePressed', e => {
      // const { string, fret, note } = e.detail;

      // // dodaj novu notu na kraj
      // this.insertNote(string, fret, this.notes.length);
      const { string, fret, note } = e.detail;
      this.insertNote(string, fret, this.notes.length, note);

      // osveži harmonika tabove
      //this.refreshHarmonicaTabs();
    });

    document.addEventListener('click', e => {
      // proveri da li je kliknut element koji NIJE nota
      if (!e.target.classList.contains('tab-note')) {
        this.selectedIndex = null;
        this.inputBuffer = '';

        // ukloni vizuelnu selekciju
        this.guitarDiv.querySelectorAll('.tab-note.selected')
          .forEach(sel => sel.classList.remove('selected'));
      }
    });

    // tastatura za editovanje
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.selectedIndex = null;
        this.inputBuffer = '';
        this.guitarDiv.querySelectorAll('.tab-note.selected')
          .forEach(sel => sel.classList.remove('selected'));
      }

      if (this.selectedIndex !== null) {
        // unos cifara
        if (e.key >= '0' && e.key <= '9') {
          let cif = e.key;
          this.inputBuffer += cif; // dodaj cifru u buffer

          const fretNum = parseInt(this.inputBuffer, 10);

          // validacija: mora biti broj i <= max fretova
          if (!isNaN(fretNum) && fretNum <= this.fretboard.numOfFrets) {
            this.editSelected(fretNum);
            //this.inputBuffer = '';
          }else{
            this.editSelected(parseInt(cif, 10));
            this.inputBuffer = cif;
          }
        }

        // potvrda unosa (Enter)
        if (e.key === 'Enter') {
          this.inputBuffer = ''; // resetuj buffer
        }

        // brisanje selektovane
        if (e.key === 'Delete') {
          this.deleteSelected();
          this.inputBuffer = '';
        }
      }
    });
  }


  refreshHarmonicaTabs() {
  this.harmonicaDiv.innerHTML = '';
  const harmonicaNotes = this.harmonica.getPlayableNotes();

  this.notes.forEach(n => {
    const playable = harmonicaNotes.findLast(h => h.note === n.note);

    const span = document.createElement('span');
    if (playable) {
      span.textContent = playable.tab.toString().padStart(3, ' ');
    } else {
      span.textContent = ' no ';
    }
    this.harmonicaDiv.append(span);
  });
}

}
