(function() {
  
  function WavNode() {
    this.node = null;
    this._buffers = [];
    this._sampleCount = 0;
    this._sampleRate = 0;
    this._channels = 0;
    if (context.createScriptProcessor) {
      this.node = context.createScriptProcessor(1024, this.channels,
        this.channels);
    } else if (context.createJavaScriptNode) {
      this.node = context.createJavaScriptNode(1024, this.channels,
        this.channels);
    } else {
      throw new Error('No javascript processing node available.');
    }
    this.node.onaudioprocess = function(event) {
      var input = event.inputBuffer;
      if (this._sampleRate === 0) {
        this._sampleRate = Math.round(input.sampleRate);
      }
      if (this._channels === 0) {
        this._channels = input.numberOfChannels;
      }
      
      // Interleave the audio data
      var sampleCount = input.length;
      this._sampleCount += dataCount;
      var buffer = new ArrayBuffer(sampleCount * this._channels * 2);
      var view = new DataView(buffer);
      var x = 0;
      for (var i = 0; i < sampleCount; ++i) {
        for (var j = 0; j < input.numberOfChannels; ++j) {
          var value = Math.round(input.getChannelData(j)[i] * 0x8000);
          view.setInt16(x, value, true);
          x += 2;
        }
      }
      this._buffers.push(buffer);
      
      // If I don't do this, the entire thing backs up after a few buffers.
      event.outputBuffer = event.inputBuffer;
    }.bind(this);
  }
  
  WavNode.prototype.sound = function() {
    // Setup the buffer
    var buffer = new ArrayBuffer(44 + this._sampleCount*this._channels*2);
    var view = new DataView(buffer);
    
    // Setup the header
    var header = new Header(view);
    header.setDefaults();
    header.setFields(this._sampleCount, this._sampleRate, 16, this._channels);
    
    // Copy the raw data
    var byteIdx = 44;
    for (var i = 0; i < this._buffers.length; ++i) {
      var aBuffer = this._buffers[i];
      var aView = new DataView(aBuffer);
      var len = aBuffer.length;
      for (var j = 0; j < len; ++j) {
        view.setUint8(byteIdx++, aView.getUint8(j));
      }
    }
    
    return new window.jswav.Sound(buffer);
  };
  
  if (!window.jswav) {
    window.jswav = {};
  }
  window.jswav.WavNode = WavNode;
  
})();