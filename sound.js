(function() {
  function Header(view) {
    this.view = view;
  }
  
  Header.prototype.getBitsPerSample = function() {
    return this.view.getUint16(34, true);
  };
  
  Header.prototype.getChannels = function() {
    return this.view.getUint16(22, true);
  };
  
  Header.prototype.getDuration = function() {
    return this.getSampleCount() / this.getSampleRate();
  };
  
  Header.prototype.getSampleCount = function() {
    var bps = this.getBitsPerSample() * this.getChannels() / 8;
    return this.view.getUint32(40, true) / bps;
  };
  
  Header.prototype.getSampleRate = function() {
    return this.view.getUint32(24, true);
  };
  
  Header.prototype.setDefaults = function() {
    this.view.setUint32(0, 0x46464952, true); // RIFF
    this.view.setUint32(8, 0x45564157, true); // WAVE
    this.view.setUint32(12, 0x20746d66, true); // "fmt "
    this.view.setUint32(16, 0x10, true); // length of "fmt"
    this.view.setUint16(20, 1, true); // format = PCM
    this.view.setUint32(36, 0x61746164, true); // "data"
  };
  
  Header.prototype.setFields = function(count, rate, bitsPerSample, channels) {
    totalSize = count * (bitsPerSample / 8) * channels;
    
    this.view.setUint32(4, totalSize + 36, true); // size of "RIFF"
    this.view.setUint16(22, channels, true); // channel count
    this.view.setUint32(24, sampleRate, true); // sample rate
    this.view.setUint32(28, sampleRate * channels * bitsPerSample,
      true); // byte rate
    this.view.setUint16(32, bitsPerSample * channels / 8, true); // block align
    this.view.setUint16(34, bitsPerSample, true); // bits per sample
    this.view.setUint32(40, totalSize, true); // size of "data" block
  };
  
  function Sound(buffer) {
    this.buffer = buffer;
    this._view = new DataView(this.buffer);
    this._header = new Header(this._view);
  }
  
  Sound.prototype.getSample = function(idx) {
    // TODO: this
  };
  
  if !window.jswav {
    window.jswav = {};
  }
  window.jswav.Sound = Sound;
})();