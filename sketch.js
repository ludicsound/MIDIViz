let inputSoftware;
let inputSelect;
let rateSelect;
let w_width;
let b_width;
let y_playHead;
let x_playHead;
let active_w_notes;
let active_b_notes;
let pc_colors;
let inverted;
let scroll_rate;
let prevNote;

//notation variables
let staffSpace;
let staffMarginTop;
let staffMarginLeft;
let middleC;

//preload assets
let trebleClef;
let bassClef;
let musicFont;

function preload() {
  trebleClef = loadImage('assets/treble_clef.png');
  bassClef = loadImage('assets/bass_clef.png');
  musicFont = loadFont('assets/NotoMusic-Regular.ttf');
}

function setup() {
  //400 by 400 pixel canvas
  createCanvas(windowWidth, windowHeight);

  //drawing constants
  w_width = width/52;
  b_width = 2*width/52/3;
  y_top_margin = 80;
  y_playHead = height/2 + y_top_margin;

  //notation constants
  staffSpace = (height - y_playHead)/20;
  staffMarginTop = y_playHead + ((height - y_playHead)/2) - (5*staffSpace);
  staffMarginLeft = width/25;
  x_playHead = staffMarginLeft*4;
  middleC = staffMarginTop + (4.5*staffSpace);

  //MIDI handling variable initalization
  active_w_notes = new Map();
  active_b_notes = new Map();

  pc_colors = [
    color(255, 0, 0, 0), //C-red
    color(255, 64, 64, 0), //C# - red-orange
    color(255, 127, 127, 0), //D - mauve
    color(255, 127, 0, 0), //D# - orange
    color(255, 192, 0, 0), //E - orange-yellow
    color(0, 255, 0, 0), //F - Green
    color(0, 127, 255, 0), //F# - Green-blue
    color(0, 0, 255, 0), //G - blue
    color(37, 0, 192, 0), //G# - blue-purple
    color(75, 0, 127, 0), //A - purple
    color(140, 0, 211, 0), //B - violet
    color(255, 0, 127, 0) //A# - magenta
  ];

  inverted = false;

  //UI CONTROLS
  //MIDI input selection
	inputSelect = createSelect('MIDI Input');
  inputSelect.position(10, 50);
  inputSelect.changed(incomingMIDIPort);

  rateSelect = createSelect('Speed');
  rateSelect.position(450, 50);
  rateSelect.option("Slow", 0.5);
  rateSelect.option("Medium", 1);
  rateSelect.option("Fast", 2);
  rateSelect.option("Very Fast", 4);
  rateSelect.selected(2);
  //rateSelect.changed(rateChanged);
  scroll_rate = rateSelect.value();

  directionBox = createCheckbox('', false);
  directionBox.position(200, 48);
  directionBox.changed(invert);
  const box = directionBox.elt.getElementsByTagName('input')[0];
	box.style.width = '18px';
	box.style.height = '18px';

  ////
  //Setting up MIDI
  ////
	WebMidi.enable(function (err) { //check if WebMidi.js is enabled

  if (err) {
      console.log("WebMidi could not be enabled.", err);
    } else {
      console.log("WebMidi enabled!");
    }

  //name our visible MIDI input and output ports
  console.log("---");
  console.log("Inputs Ports: ");
  for(i = 0; i< WebMidi.inputs.length; i++){
     console.log(i + ": " + WebMidi.inputs[i].name);
		 //let inputPort = createElement('h3', i + ": " + WebMidi.inputs[i].name);
		 //inputPort.position(20, 65+(i*20));
		 inputSelect.option(WebMidi.inputs[i].name, i);
     if (i === (WebMidi.inputs.length - 1)) {
       inputSelect.selected(i);
       incomingMIDIPort();
     }
  }

  console.log("---");
  console.log("Output Ports: ");
  for(i = 0; i< WebMidi.outputs.length; i++){
  		console.log(i + ": " + WebMidi.outputs[i].name);
    }
  //Choose an input port

  //inputSoftware = WebMidi.inputs[0];
    //The 0 value is the first value in the array
    //Meaning that we are going to use the first MIDI input we see
    //This can be changed to a different number,
    //or given a string to select a specific port

  ///
  //listen to all incoming "note on" input events

    //
    //end of MIDI setup
    //
	});
}

function incomingMIDIPort () {
		for (let i = 0; i < WebMidi.inputs.length; i++) {
			WebMidi.inputs[i].close;
      WebMidi.inputs[i].removeListener();
		}

		inputSoftware = WebMidi.inputs[inputSelect.value()];
		inputSoftware.open();

		if (!inputSoftware.hasListener('noteon')) {

			inputSoftware.addListener('noteon', "all",
				function (e) {
					//Show what we are receiving
					console.log("Received 'noteon' message (" + e.note.name + e.note.octave + ") "+ e.note.number +".");
          //add note to activeNotes
          //let note = new MIDINoteInverted(e.note);
          let note;
          if (inverted) {
            note = new MIDINoteInverted(e.note);
          } else {
            //console.log ('creating normal midi note');
            note = new MIDINote(e.note);
          }
          //console.log ('inverted:'+inverted + ', y_extent:' + note.y_extent);
          if (note.accidental) {
            if (active_b_notes.has(e.note.number)) {
              active_b_notes.get(e.note.number).push(note);
            } else {
              active_b_notes.set(e.note.number, [note]);
            }
          } else {
            if (active_w_notes.has(e.note.number)) {
              active_w_notes.get(e.note.number).push(note);
            } else {
              active_w_notes.set(e.note.number, [note]);
            }
          }
          prevNote = note;
				}
			);

      console.log('MIDI Port: ' + inputSoftware.name + ' - added a MIDI listener');
		}

		//The note off functionality will need its own event listener
		//You don't need to pair every single note on with a note off
		if (!inputSoftware.hasListener('noteoff')) {
			inputSoftware.addListener('noteoff', "all",
				function (e) {
					//Show what we are receiving
					console.log("Received 'noteoff' message (" + e.note.name + e.note.octave + ") "+ e.note.number +".");
          let noteNumArray;
          if ([1, 3, 6, 8, 10].indexOf(e.note.number%12) !== -1) {
            noteNumArray = active_b_notes.get(e.note.number);
          }  else {
            noteNumArray = active_w_notes.get(e.note.number);
          }
          let note = noteNumArray[noteNumArray.length - 1];
          note.release();
          note.musicalNote.release();
				}
			);
		}
}

function invert () {
  inverted = inverted == false;
  console.log('DIRECTION CHANGED, inverted:' + inverted);
  if(inverted) {
    console.log('verified true');
  } else {
    console.log('verified false');
  }
}
function drawNote(value, key, map) {
  /*
  value.forEach((item, i) => {
    //draw background color block
    let color = item.noteColor();
    if (item.isPlaying) {
      fill(item.bg_color);
      noStroke();
      if (item.accidental) {
        rect(item.x, y_top_margin, b_width, (y_playHead - y_top_margin) * 0.955);
      } else {
        rect(item.x, y_top_margin, w_width, y_playHead - y_top_margin);
      }
    }
  });
  */
  value.forEach((item, i) => {
    //draw midi and musical notes
    noStroke();
    item.draw();
    item.musicalNote.draw();
    if(item.done) {
      console.log('deleting oldest item');
      //item.musicalNote = null;
      value.splice(i, 1);
    }
  });
}

function draw() {
	//Draw Background
  background(255, 255, 0);

  //Draw UI Control Headings
  textFont('Helvetica-Light');
  fill(51);
  textSize(32);
  text('MIDI Input', 10, 38);
  text('Invert Direction', 202, 38);
  text('Speed', 448, 38);

  //Draw Notation Background
  noStroke();
  fill(255);
  rect(staffMarginLeft/2, staffMarginTop-(staffSpace*2), width-staffMarginLeft, staffSpace*14);

  //Draw Notes (MIDI + Notation)
  textFont(musicFont);
	stroke(0);
  w_pianoKeys();
  active_w_notes.forEach(drawNote);
  b_pianoKeys();
  active_b_notes.forEach(drawNote);

  //Draw Grand Staff
  grandStaff();
}

function w_pianoKeys() {
  for (let i = 0; i<52; i++) {
    fill(color(255));
    stroke(0);
    rect(0 + i*w_width, y_top_margin, w_width, y_playHead - y_top_margin);
  }
}

function b_pianoKeys() {
  for (let i = 0; i<51; i++) {
    if([0, 2, 3, 5, 6].indexOf(i%7) !== -1) {
      fill(color(64));
      stroke(64);
      rect(b_width + (i*w_width), y_top_margin, b_width, (y_playHead - y_top_margin) * 0.955);
    }
  }
}

function staff(x, y) {
  let y_line;
  stroke(0);
  strokeWeight(2);
  line(x, y, x, y + (4*staffSpace));
  for (let i = 0; i<5; i++) {
    y_line = y + (i * staffSpace);
    line(x, y_line, width-x, y_line);
  }
}

function grandStaff() {
  strokeWeight(5);
  strokeCap(SQUARE);
  staff(staffMarginLeft, staffMarginTop);
  staff(staffMarginLeft, staffMarginTop+(6*staffSpace));

  let imageScale = staffSpace * 6.5;
  image(trebleClef, staffMarginLeft-(0.5*staffMarginLeft), staffMarginTop-(0.8*staffSpace), imageScale, imageScale);
  image(bassClef, staffMarginLeft-(0.5*staffMarginLeft), staffMarginTop+(4.25*staffSpace), imageScale, imageScale);
  strokeWeight(5);
  line(staffMarginLeft, staffMarginTop-(0.05*staffSpace), staffMarginLeft, staffMarginTop+(10.05*staffSpace));
  line(x_playHead, staffMarginTop-(1.5*staffSpace), x_playHead, staffMarginTop+(11.5*staffSpace));
  strokeWeight(1);
}
