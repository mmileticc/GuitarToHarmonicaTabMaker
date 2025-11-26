export class NoteSystem {
  constructor() {
    this.notesSharp = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    this.notesFlat  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
    this.isSharp = true;
    this.notes = this.notesSharp;
  }

  setNotation(type) {
    this.isSharp = (type === 'sharp');
    this.notes = this.isSharp ? this.notesSharp : this.notesFlat;
  }

  findIndex(note) {
    if(note.includes('b')) return this.notesFlat.indexOf(note);
    if(note.includes('#')) return this.notesSharp.indexOf(note);
    return this.notes.indexOf(note);
  }
}