class MIDINote extends Note {
  constructor(e) {
    super(e);

    this.width = this.accidental ? b_width : w_width;
    this.x_offset = this.accidental ? b_width : 0;
    this.x = this.x();

    this.y_extent = y_top_margin;

    this.musicalNote = new MusicalNote(e);
  }

  noteColor() {
    if(this.isPlaying && !this.done){
      this.color = this.bg_color;
      this.alpha -= (this.alphaIncrement)*this.rate;
      this.color.setAlpha(this.alpha);
      //this.bg_color.setAlpha(this.alpha);
    }
    return this.color;
  }

  dur() {
    //if note is still being held, increment duration
    if(!this.released) {
      this.duration += this.rate;
    }
    if((this.y_extent + this.duration) >= y_playHead) {
      this.isPlaying = true;
    }
    //if note extends to the playHead and is not done playing, decrement duration
    if (this.isPlaying && !this.done){
      this.duration -= this.rate;
    }
    return this.duration;
  }

  y() {
    //if note is released and is not done playing, increment y_extent
    if(this.released && !this.done) {
      this.y_extent += this.rate;
    }
    //if y_extent exceeds position of the playHead, note is done playing and can be scheduled for deletion
    if(this.y_extent >= y_playHead) {
      this.done = true;
    }
    return this.y_extent;
  }
  x() {
    let pos;
    switch (this.number%12) {
      case 0: pos = w_width*2; break;
      case 1: pos = w_width*2; break;
      case 2: pos = w_width*3; break;
      case 3: pos = w_width*3; break;
      case 4: pos = w_width*4; break;
      case 5: pos = w_width*5; break;
      case 6: pos = w_width*5; break;
      case 7: pos = w_width*6; break;
      case 8: pos = w_width*6; break;
      case 9: pos = w_width*7; break;
      case 10: pos = w_width*7; break;
      case 11: pos = w_width*8; break;
    }
    return (pos + ((this.octave-1) * 7 * w_width)) + this.x_offset;
  }
  draw() {
    fill(this.noteColor());
    rect(this.x, this.y(), this.width, this.dur());
  }
}
