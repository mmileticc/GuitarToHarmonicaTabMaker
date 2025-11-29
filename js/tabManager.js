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

    this.mode = 'editFromFretboard'; // 'append' | 'editFromFretboard' | 'insertAfter'
    this.editTarget = 'string+fret'; // ili 'fret-only' ako želiš da zadržiš isti string


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
  const scrollPos = this.guitarDiv.scrollTop; // zapamti poziciju

  this.guitarDiv.innerHTML = '';

  // const container = document.createElement('div');
  // container.id = 'guitarTabs';

  // širina diva i širina jedne note
  const divWidth = this.guitarDiv.clientWidth;
  const noteWidth = 34; // 30px + gap
  let notesPerBlock = Math.max(1, Math.floor(divWidth / noteWidth)) - 1;
  notesPerBlock = notesPerBlock < 1? 1: notesPerBlock;


  //const notesPerBlock = 20; // koliko nota po measure-u
  const totalBlocks = Math.ceil(this.notes.length / notesPerBlock) || 1;

  for (let blockIndex = 0; blockIndex < totalBlocks; blockIndex++) {
    const measure = document.createElement('div');
    measure.classList.add('measure');

    this.tuning.forEach((openNote, stringIndex) => {
      const stringRow = document.createElement('div');
      stringRow.classList.add('guitar-string');

      // labela otvorene žice
      const label = document.createElement('span');
      label.textContent = openNote.padEnd(4, ' ') + '|';
      label.style.minWidth = '40px';
      stringRow.append(label);

      // note za ovaj blok
      const start = blockIndex * notesPerBlock;
      const end = start + notesPerBlock;
      const blockNotes = this.notes.slice(start, end);

      blockNotes.forEach(note => {
        const span = document.createElement('span');
        if (note.string === stringIndex) {
          span.className = (note.position === this.selectedIndex) ? 'tab-note selected' : 'tab-note';
          span.dataset.pos = note.position;
          span.textContent = note.fret;
          span.addEventListener('click', () => this.selectNoteByPosition(note.position));
        } else {
          span.classList.add('tab-note', 'no-hover');
          span.textContent = '-';
        }
        stringRow.append(span);
      });

      measure.append(stringRow);
    });

    this.guitarDiv.append(measure);
  }

  // this.guitarDiv.append(container);
  this.refreshHarmonicaTabs();
  
  
  requestAnimationFrame(() => {
    this.guitarDiv.scrollTop = scrollPos;
  });


}



  // slusa dogadjaje sa fretboarda
  listen() {
    
    document.addEventListener('notePressed', e => {
      const { string, fret, note } = e.detail;

      // Nema selekcije → uvek append
      if(this.selectedIndex === null){
        this.insertNote(string, fret, this.notes.length, note);
        return;
      }
      
      // Uređivanje selektovane note iz fretboarda
       if (this.mode === 'editFromFretboard') {
        const pos = this.selectedIndex;
        const n = this.notes.find(x => x.position === pos);
        if (!n) return;

        if (this.editTarget === 'string+fret') {
          n.string = string;
          n.fret = fret;
          n.note = note; // pitch direktno iz fretboarda (već izračunat)
        } else { // 'fret-only'
          n.fret = fret;
          // ažuriraj pitch na osnovu originalnog stringa + novog praga
          const openNote = this.tuning[n.string];
          const octave = parseInt(openNote.slice(-1), 10);
          const noteName = openNote.slice(0, -1);
          const rootIndex = this.fretboard.noteSystem.findIndex(noteName);

          const idx = (rootIndex + fret) % this.fretboard.noteSystem.notes.length;
          const octaveDiff = Math.floor((rootIndex + fret) / this.fretboard.noteSystem.notes.length);
          n.note = this.fretboard.noteSystem.notes[idx] + (octave + octaveDiff);
        }

        this.refresh();
        return;
      }

      // Insert posle selektovane note
      if (this.mode === 'insertAfter') {
        const pos = this.selectedIndex + 1;
        this.insertNote(string, fret, pos, note);
        // opcionalno: pomeri selekciju na novo ubacenu notu
        this.selectedIndex = pos;
        return;
      }
    });



    document.addEventListener('click', e => {
      // proveri da li je kliknut element koji NIJE nota
      if (!e.target.classList.contains('tab-note')) {
        this.selectedIndex = null;
        this.inputBuffer = '';

        // ukloni vizuelnu selekciju
        this.guitarDiv.querySelectorAll('.tab-note.selected')
          .forEach(sel => sel.classList.remove('selected'));
        this.harmonicaDiv.querySelectorAll('.tab-note.selected')
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

    window.addEventListener('resize', () => this.refresh());
  }


  refreshHarmonicaTabs() {
  this.harmonicaDiv.innerHTML = '';
  const harmonicaNotes = this.harmonica.getPlayableNotes();

  this.notes.forEach(n => {
    const playable = harmonicaNotes.findLast(h => h.note === n.note);

    const span = document.createElement('span');

    span.classList.add("tab-note");
    span.dataset.pos = n.position;

    if (playable) {
      span.textContent = playable.tab.toString().padStart(3, ' ');
    } else {
      span.textContent = ' no ';
    }

    // klik na harmoniku → selektuj i gitaru
    span.addEventListener('click', () => {
      this.selectNoteByPosition(n.position);
    });


    this.harmonicaDiv.append(span);
  });

  
}


selectNoteByPosition(pos) {
  // resetuj selekciju
  this.guitarDiv.querySelectorAll('.tab-note.selected')
    .forEach(sel => sel.classList.remove('selected'));
  this.harmonicaDiv.querySelectorAll('.tab-note.selected')
    .forEach(sel => sel.classList.remove('selected'));

  const gEl = this.guitarDiv.querySelector(`.tab-note[data-pos="${pos}"]`);
  const hEl = this.harmonicaDiv.querySelector(`.tab-note[data-pos="${pos}"]`);

  if (gEl) {
    this.selectedIndex = pos;
    this.inputBuffer = '';
    gEl.classList.add('selected');
  }
  if (hEl) {
    hEl.classList.add('selected');
  }
}

}
