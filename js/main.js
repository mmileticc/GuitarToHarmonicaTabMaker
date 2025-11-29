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
    this.tabs.refresh();
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
        const buttons = document.querySelectorAll('.btn-theme');

    themeSelect.addEventListener('change', e => {
      const theme = e.target.value;

      buttons.forEach(btn => {
        btn.classList.remove('btn-mahogany', 'btn-maple', 'btn-ebony', 'btn-custom');
        btn.classList.add(`btn-${theme}`);
      });

      if (e.target.value === 'custom') {
        colorPicker.style.display = 'inline';
        this.fretboard.setTheme('custom', colorPicker.value);

        document.documentElement.style.setProperty('--custom-main', colorPicker.value);
        document.documentElement.style.setProperty('--custom-accent', lightenColor(colorPicker.value, 0.3));
      } else {
        colorPicker.style.display = 'none';
        this.fretboard.setTheme(e.target.value);
      }
    });

    colorPicker.addEventListener('input', e => {
      this.fretboard.setTheme('custom', e.target.value);

      document.documentElement.style.setProperty('--custom-main', e.target.value);
      document.documentElement.style.setProperty('--custom-accent', lightenColor(e.target.value, 0.3));
    });




    const btnToggleMode = document.getElementById('btnToggleMode');
    const btnDelete = document.getElementById('btnDelete');
    const btnClearConfirm = document.getElementById('confirmClear');

    btnToggleMode.addEventListener('click', () => {
      if (this.tabs.mode === 'editFromFretboard') {
        this.tabs.mode = 'insertAfter';
        btnToggleMode.textContent = '➕ Mode: Insert After';
        
      } else {
        this.tabs.mode = 'editFromFretboard';
        btnToggleMode.textContent = '✏️ Mode: Edit Selected';
       
      }
    });

    

    btnDelete.addEventListener('click', () => {
      this.tabs.deleteSelected();
    });

    // potvrda brisanja cele tablature
    btnClearConfirm.addEventListener('click', () => {
      this.tabs.clearAll();
      // zatvori modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('clearModal'));
      modal.hide();
    });
  }
}

// Start aplikacije
new AppController();