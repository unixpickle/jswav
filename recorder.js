(function() {
  
  function Recorder() {
    this.ondone = null;
    this.onerror = null;
    this.onstart = null;
    this.channels = 2;
    this._started = false;
    this._stopped = false;
    this._stream = null;
  }
  
  Recorder.prototype.start = function() {
    if (this._started) {
      throw new Error('Recorder was already started.');
    }
    this._started = true;
    getUserMedia(function(err, stream) {
      if (this._stopped) {
        return;
      }
      if (err !== null) {
        if (this.onerror !== null) {
          this.onerror(err);
        }
        return;
      }
      this._stream = stream;
      try {
        this._handleStream();
      } catch (e) {
        this._stream.stop();
        this._stopped = true;
        if (this.onerror !== null) {
          this.onerror(e);
        }
      }
    }.bind(this));
  };
  
  Recorder.prototype.stop = function() {
    if (!this._started) {
      throw new Error('Recorder was not started.');
    }
    if (this._stopped) {
      return;
    }
    this._stopped = true;
    if (this._stream !== null) {
      this._stream.stop();
    }
  }
  
  Recorder.prototype._handleStream = function() {
    var AudioContext = (window.AudioContext || window.webkitAudioContext);
    var context = new AudioContext();
    var source = context.createMediaStreamSource(this._stream);
    var wavNode = new window.jswav.WavNode();
    source.connect(wavNode.node);
    wavNode.node.connect(context.destination);
    this._stream.onended = function() {
      source.disconnect(wavNode.node);
      wavNode.node.disconnect(context.destination);
      if (this.ondone !== null) {
        this.ondone(wavNode.sound());
      }
    }.bind(this);
    if (this.onstart !== null) {
      this.onstart();
    }
  }
  
  function getUserMedia(cb) {
    var gum = (navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia);
    if (!gum) {
      setTimeout(function() {
        cb('getUserMedia() is not available.', null);
      }, 10);
      return;
    }
    gum.call(navigator, {audio: true, video: false},
      function(stream) {
        cb(null, stream);
      },
      function(err) {
        cb(err, null);
      }
    );
  }
  
  if (!window.jswav) {
    window.jswav = {};
  }
  window.jswav.Recorder = Recorder;
  
})();