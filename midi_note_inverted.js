class MIDINoteInverted extends MIDINote {
  constructor(e) {
    super(e);
    this.y_extent = y_playHead;
  }

  noteColor() {
    if(this.isPlaying && !this.done){
      this.alpha -= (this.alphaIncrement)*this.rate;
      this.color = this.bg_color;
      this.color.setAlpha(this.alpha);
      if(this.alpha <= 0) {
        this.isPlaying = false;
      }
    }
    return this.color;
  }

  dur() {
    //if note is still being held, increment duration
    if(!this.released) {
      this.duration -= this.rate;
    }

    if((this.y_extent + this.duration) <= (y_top_margin - 2)) {
      this.isPlaying = true;
      this.duration +=this.rate;
    }

    return this.duration;
  }

  y() {
    //if note is released and is not done playing, increment y_extent
    if(this.released && !this.done) {
      this.y_extent -= this.rate;
    }

    //if y_extent is above position of the top margin, note is done playing and can be scheduled for deletion
    if(this.y_extent <= (y_top_margin -2)) {
      this.done = true;
    }
    return this.y_extent;
  }
}
