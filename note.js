class Note {
  constructor(e) {
    this.name = e.name;
    this.number = e.number;
    this.octave = e.octave;
    this.accidental = ([1, 3, 6, 8, 10].indexOf(this.number%12) !== -1) ? true : false;

    this.alpha = 255;
    this.alphaIncrement = 0;
    //this.color = color(255, 0, 255, 255);
    this.color = color(200, 200, 200, 255);
    this.bg_color = pc_colors[this.number%12];
    this.duration = 0;
    this.rate = rateSelect.value()*(0.05*staffSpace);
    this.released = false;
    this.isPlaying = false;
    this.done = false;
  }

  release() {
    this.released = true;
    this.alphaIncrement = 255.0/Math.abs(this.duration);
    //console.log(this.number + " alphaIncrement: " + this.alphaIncrement);
  }

  setRate () {
    this.rate = rateSelect.value()*(0.05*staffSpace);
  }
}
