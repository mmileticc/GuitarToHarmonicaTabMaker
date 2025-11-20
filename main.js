const sharpFlatChoice = document.querySelectorAll('input[name="sharpflat"]');
const form = document.getElementById('fretForm');

const fretboardDiv = document.getElementById("fretboard");
const guitarTabsDiv = document.getElementById("guitarTabs");
const harmonicaTabsDiv = document.getElementById("harmonicaTabs");

let numOfFrets = 18;
const notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const notesFlat =  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
let notes = notesSharp;
let isSharp = true;
const numOfNotes = notes.length;
const standardTuning = [  'E4',
                'B3',
                'G3',
                'D3',
                'A2',
                'E2'];

let tuning = standardTuning;


let guitarTabs = []


//production testing necessities
const mess = document.getElementById("testMess");

 //////////////////////////////  /\ declarations /\  /////////////////////////////////////////

//testing deo kodaaa //////////////////////////////////
let index = findNotesIndex('Gb');

fretboardDiv.append(index);
refreshNeck();
clearGuitarTabs();
refreshGuitarTabs();
///////////////////////////////////////////////////////


function findNotesIndex(note){
    if(note.includes('b')) return notesFlat.findIndex(x => x == note);
    if(note.includes('#')) return notesSharp.findIndex(x => x == note);

    return notes.findIndex(x => x == note);
}

function changeToSharpOrFlat(SorF){
    if(SorF == "sharp"){
        if(isSharp) return;
        isSharp = true;
        notes = notesSharp;
    }else{
        if(!isSharp) return;
        isSharp = false;
        notes = notesFlat;
    }
    refreshNeck();
}


function refreshNeck(){
    fretboardDiv.innerHTML = '';
    var table = document.createElement('table');
    //let stringNumber = 1;

    //printing all strings
    tuning.slice().forEach((noteFull, stringIndex)=>{
        const stringNumber = stringIndex; // + 1 optional, for now let it be for testing purpose it is prittier
        const octave = parseInt(noteFull.slice(-1), 10);
        const noteName = noteFull.slice(0, -1);
        const rootNoteIndex = findNotesIndex(noteName); 

        let string = document.createElement('tr');
        
        for(let i = 0; i <  numOfFrets + 1; i++){
            var note = document.createElement('td');
            note.classList.add("fretField");
            if(i == 0){
                note.classList.add('zeroFret');
            }
            var myIndex = rootNoteIndex + i;
            var octaveDif = Math.floor(myIndex / numOfNotes);
            myIndex %= numOfNotes;

            var myOctave = octave + octaveDif; 
            note.textContent = notes[myIndex] + myOctave;
            // note.setAttribute("string", stringNumber);
            // note.setAttribute("fretNumber", i);

            note.addEventListener('click', () => {
                noteClickHandler(stringNumber, i);
            });

            string.append(note);
        }
        table.append(string);

        //stringNumber++;
    });

    //pritning numerations under the guitar neck (fretboard)
    var numeration = document.createElement('tr');
    for(var i = 0; i <  numOfFrets + 1; i++){
        var num = document.createElement('td');
        num.classList.add('tdNoBorder');
        num.textContent = i;
        if([3, 5, 7, 9, 12, 15, 17, 19, 21, 24].find(x => x == i)){
            num.classList.add('boldNumeration');
        }
        numeration.append(num);
    }
    table.append(numeration);

    fretboardDiv.append(table);
    
}

let pressedNotes = []

function noteClickHandler(string, fret){
    
    // const cell = document.createElement('div');
    // cell.textContent = 'zica' + string + ' prag '+ fret;
    // cell.classList.add('cell');
    // pressedNotes.push(cell);

    addNoteToGuitarTab(string, fret);
    refreshGuitarTabs();

    //mess.appendChild(cell);
    // drawNotes();

}
// function drawNotes(){
//     mess.innerHTML = '';
//     pressedNotes.forEach(element => {
//         mess.append(element);
//     });
// }

function changeNumOfFrets(newNum){
    numOfFrets = parseInt(newNum);
    refreshNeck();
}



function clearGuitarTabs(){
    guitarTabs =  [' ',' ',' ',' ',' ',' '];//tuning.map(note => note + ' |');

    refreshGuitarTabs();
}
function addNoteToGuitarTab(stringNumber, fretNumber){


    for(var i = 0; i < guitarTabs.length; i++){
        if(i == stringNumber){
            const padded = fretNumber.toString().padStart(2, '-');
            guitarTabs[i] += padded;

        }else{
             guitarTabs[i] += '--';
        }
        guitarTabs[i] += '-';
    }
}




////////////////////////////////////////// first version of guitar tabs, it is not modular
function splitTabsIntoLines(tabLines, maxWidth = 60) {
  const splitLines = [];

  // za svaku zicu
  for (let i = 0; i < tabLines.length; i++) {
    const line = tabLines[i];
    const chunks = [];

    for (let j = 0; j < line.length; j += maxWidth) {
      chunks.push(line.slice(j, j + maxWidth));
    }

    splitLines.push(chunks);
  }

  return splitLines;
}

function refreshGuitarTabs() {
    guitarTabsDiv.innerHTML = '';

    
    const maxChars = Math.floor((guitarTabsDiv.getBoundingClientRect().width - 20) / 8);
    const split = splitTabsIntoLines(guitarTabs, maxChars);

    const numRows = split[0].length; // broj redova po zici
    const openLabels = getOpenStringLabels();

    for (let row = 0; row < numRows; row++) {
        for (let string = 0; string < split.length; string++) {
            const line = document.createElement('pre');
            line.classList.add('guitar-tab-output');

            const label = openLabels[string];
            const tabContent = split[string][row] || '';
            line.textContent = label + tabContent;

            guitarTabsDiv.append(line);
        }

        // razmak izmedju grupa
        const spacer = document.createElement('div');
        spacer.style.height = '10px';
        spacer.style.backgroundColor = 'beige';

        guitarTabsDiv.append(spacer);
    }
}

function getOpenStringLabels() {
  return tuning.map(note => note.padEnd(4, ' ') + '|'); // npr. 'E2  ', 'A2  ', ...
}

////////////  \/ listeneri \/ //////////////////////////////////

sharpFlatChoice.forEach(radio => {
    radio.addEventListener('change', (event) => {
        if (event.target.checked) {
            console.log('Izabrana prikaz nota:', event.target.value);
            changeToSharpOrFlat(event.target.value);
        }
    });
    
});


form.addEventListener('submit', (event) => {
    event.preventDefault(); // sprecava reload stranice
    const num = form.elements.numOfFrets.value;
    console.log('Izabrano:', num, ' fretova');
    changeNumOfFrets(num);
});


window.addEventListener('resize', () => {
  refreshGuitarTabs(); // koristi novu sirinu
});