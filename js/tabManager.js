
export class TabManager {
  constructor(guitarDiv, harmonicaDiv, harmonica, tuning) {
    this.guitarDiv = guitarDiv;
    this.harmonicaDiv = harmonicaDiv;
    this.harmonica = harmonica;
    this.tuning = tuning;
    this.guitarTabs = Array(tuning.length).fill(' ');
    this.listen();
  }

  listen() {
    document.addEventListener('notePressed', e => {
      const { string, fret, note } = e.detail;
      this.addGuitarTab(string, fret);
      this.refreshGuitarTabs();
      this.refreshHarmonicaTabs(note);
    });
  }

  addGuitarTab(stringNumber, fretNumber) {
    this.guitarTabs = this.guitarTabs.map((line, i) => {
      if (i === stringNumber) {
        return line + fretNumber.toString().padStart(2, '-') + '-';
      }
      return line + '--' + '-';
    });
  }

  refreshGuitarTabs() {
    this.guitarDiv.innerHTML = '';
    const openLabels = this.tuning.map(note => note.padEnd(4, ' ') + '|');

    this.guitarTabs.forEach((line, i) => {
      const pre = document.createElement('pre');
      pre.textContent = openLabels[i] + line;
      this.guitarDiv.append(pre);
    });
  }

  refreshHarmonicaTabs(note) {
    const playable = this.harmonica.getPlayableNotes().findLast(n => n.note === note);
    if (playable) {
      this.harmonicaDiv.append(playable.tab.toString().padStart(3, ' '));
    }
  }
}