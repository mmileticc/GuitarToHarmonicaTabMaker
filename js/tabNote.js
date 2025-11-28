export class TabNote {
  constructor(string, fret, position, note) {
    this.string = string;     // broj zice
    this.fret = fret;         // broj praga
    this.position = position; // indeks u nizu
    this.note = note;         // pitch, npr. "C#4"
  }
}