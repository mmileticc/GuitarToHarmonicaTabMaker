import { DiatonicHarmonica } from './harmonica.js';
import { TabManager } from './tabManager.js';
import { NoteSystem } from './noteSystem.js';
import { Fretboard } from './fretboard.js';

class AppController {
  constructor() {
    this.noteSystem = new NoteSystem();
    this.harmonica = new DiatonicHarmonica('C');
    this.fretboard = new Fretboard(
      document.getElementById("fretboard"),
      ['E4','B3','G3','D3','A2','E2'],
      this.noteSystem,
      this.harmonica
    );
    this.tabs = new TabManager(
      document.getElementById("guitarTabs"),
      document.getElementById("harmonicaTabs"),
      this.harmonica,
      this.fretboard.tuning,
      this.fretboard
    );

    this.initListeners();
    this.fretboard.render();
  }

  initListeners() {
    // sharp/flat toggle
    document.querySelectorAll('input[name="sharpflat"]').forEach(radio => {
      radio.addEventListener('change', e => {
        this.noteSystem.setNotation(e.target.value);
        this.fretboard.render();
      });
    });

    // broj pragova
    document.getElementById('fretForm').addEventListener('submit', e => {
      e.preventDefault();
      const num = e.target.elements.numOfFrets.value;
      this.fretboard.setNumOfFrets(parseInt(num));
    });

    // promena tonaliteta harmonike
    document.getElementById('harmonicaKey').addEventListener('change', e => {
      this.harmonica.setKey(e.target.value);
      this.fretboard.render();
      this.tabs.refresh();
    });

    // resize
    window.addEventListener('resize', () => this.tabs.refresh());


    // color theme picker
    const themeSelect = document.getElementById('fretTheme');
    const colorPicker = document.getElementById('customColor');

    themeSelect.addEventListener('change', e => {
      if (e.target.value === 'custom') {
        colorPicker.style.display = 'inline';
        this.fretboard.setTheme('custom', colorPicker.value);
      } else {
        colorPicker.style.display = 'none';
        this.fretboard.setTheme(e.target.value);
      }
    });

    colorPicker.addEventListener('input', e => {
      this.fretboard.setTheme('custom', e.target.value);
    });
  }
}

// Start aplikacije
new AppController();