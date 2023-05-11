class MusicalNote extends Note {
  constructor(e) {
    super(e);
    this.flat = false;
    this.space = false;
    this.octaveTranspose = 0;
    this.x = width - staffMarginLeft;
    //this.rate = (this.x - x_playHead)/(y_playHead-y_top_margin) * this.rate;
    this.rate = this.setRate();
    this.y = this.yPos();
  }

  setRate () {
    this.rate = (this.x - x_playHead)/(y_playHead-y_top_margin) * this.rate;
    return this.rate;
  }

  yPos() {
    //update this.flat based on previous note value. If flat, move notated pitch 1 semitone up
    if(prevNote != null) {
      this.flat = (this.accidental && (prevNote.number > this.number || prevNote.musicalNote.flat)) ? true : false;
      if (this.flat) {
        this.number += 1;
      }
    }
    let staffPosition = middleC;
    let num_steps = 0;
    switch (this.number%12) {
      case 1: num_steps = 0; break;
      case 2: num_steps = 1; break;
      case 3: num_steps = 1; break;
      case 4: num_steps = 2; break;
      case 5: num_steps = 3; break;
      case 6: num_steps = 3; break;
      case 7: num_steps = 4; break;
      case 8: num_steps = 4; break;
      case 9: num_steps = 5; break;
      case 10: num_steps = 5; break;
      case 11: num_steps = 6; break;
    }
    // determine if note is on a line or space
    const set = [2, 3, 5, 6, 9, 10];
    let isSpace;
    if(Math.abs(this.octave)%2 == 0 && set.includes(this.number%12)) {
      this.space = true;
    }
    if(Math.abs(this.octave)%2 == 1 && !set.includes(this.number%12)) {
      this.space = true;
    }
    staffPosition = middleC - ((this.octave-4)*3.5*staffSpace);
    //console.log("Num_steps: " + num_steps);
    staffPosition -= (num_steps * (staffSpace/2));

    switch (true) {
      case this.number < 36:
        this.octaveTranspose = Math.ceil((36-this.number)/12) * -1;
        break;
      case this.number > 84:
        this.octaveTranspose = Math.ceil((this.number - 84)/12);
        break;
    }

    staffPosition += this.octaveTranspose*3.5*staffSpace;
    return staffPosition;

  }

  xPos() {
    if(this.x >= x_playHead) {
      this.x -= this.rate;
      if(!this.released) {
        this.duration += this.rate;
      }
    } else {
      this.isPlaying = true;
      this.duration -= this.rate;
    }
    //return this.x;
  }
  drawLedgerLines() {
    let line_startX = this.x - staffSpace/2;
    let line_endX = this.x + this.duration;
    let line_y;
    let count = 1;
    let n = this.number - (12*this.octaveTranspose);
    //n += this.flat ? 1 : 0;

    while ( n > 80 || n < 41) {
        if (!this.space) {
          line_y = this.y+(0.5*count*staffSpace);
        } else {
          line_y = this.y+((n < 41) ? (-0.5*staffSpace) : (0.5*staffSpace) + (0.5*count*staffSpace));
        }
        line(line_startX, line_y, line_endX, line_y);
        if (n > 80) {
          n -= 3;
          count += 2;
        } else if (n < 41) {
          n += 3;
          count -= 2;
        }
    }
    if (n == 60 || n == 61) {
      line_y = this.y+(0.5*count*staffSpace);
      line(line_startX, line_y, line_endX, line_y);
    }
  }

  draw() {
    this.xPos();
    if(this.isPlaying) {
      fill(this.color);
    } else {
      this.bg_color.setAlpha(255)
      fill(this.bg_color);
    }
    if (this.accidental) {
      textSize(staffSpace * 2);
      if (this.flat) {
        text("♭", this.x-(staffSpace*1.5), this.y+staffSpace);
      } else {
        text("♯", this.x-(staffSpace*1.5), this.y+staffSpace);
      }
    }
    textSize(staffSpace*4);
    text("𝅘", this.x-(staffSpace/2), this.y+staffSpace);
    rect(this.x, this.y+(staffSpace/4), this.duration, staffSpace/2);
    stroke(0);
    strokeWeight(2);
    this.drawLedgerLines();
    strokeWeight(1);

    if (this.octaveTranspose != 0) {
      textFont('Helvetica-Light');
      textSize(staffSpace);
      noStroke();
      let x = this.x;
      let y = this.y - staffSpace/3;
      switch (this.octaveTranspose) {
        case 1: text("8va", x, y); break;
        case 2: text("15ma", x, y); break;
      }
      textFont(musicFont);
    }
  }
}
