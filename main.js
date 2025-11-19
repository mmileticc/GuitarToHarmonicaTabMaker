const sharpFlatChoice = document.querySelectorAll('input[name="sharpflat"]');
const form = document.getElementById('fretForm');


const fret = document.getElementById("fretboard");
const guitarTabs = document.getElementById("guitarTabs");
const harmonicaTabs = document.getElementById("harmonicaTabs");

let numOfFrets = 18;
const notesSharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const notesFlat =  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
let notes = notesSharp;
let isSharp = true;
const numOfNotes = notes.length;
let tuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];



//testing deo kodaaa //////////////////////////////////
let index = findNotesIndex('Gb');

fret.append(index);
refreshFret();
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
    refreshFret();
}


function refreshFret(){
    fret.innerHTML = '';
    var table = document.createElement('table');
    //let stringNumber = 1;

    //sve zice
    tuning.slice().reverse().forEach((noteFull, stringIndex)=>{
        const stringNumber = stringIndex + 1;
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

    //numeracije polja ispod vrata 
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

    fret.append(table);
    
}
const mess = document.getElementById("testMess");
function noteClickHandler(string, fret){
    // console.log("zica ", string, ' prag ', fret);
    // mess.append("zica ", string, ' prag ', fret);
    // mess.append(document.createElement("br"));

    // mess.hidden = false;

    const cell = document.createElement('div');
    cell.textContent = 'zica' + string + ' prag '+ fret;
    cell.classList.add('fret-cell');
    mess.appendChild(cell);

}

function changeNumOfFrets(newNum){
    numOfFrets = parseInt(newNum);
    refreshFret();
}
 //listeneri//////////////////////////////////////////////////////////////////
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
