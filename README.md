# jswav

**jswav** is a dead-simple JavaScript API for dealing with microphone input and WAV audio data.

# Format support

Currently, **jswav** only supports single-channel 16-bit PCM.

# Usage

You can record audio straight from the microphone using a `Recorder`. Here is how:

    recording = new window.jswav.Recorder();
    recording.onDone = function(sound) {
        // Do something with `sound`, for example save it and download it using
        // sound.base64() which returns a base64 WAV file.
    };
    recording.onError = function(err) {
        // The recording could not be started
    };
    recording.start();

There is a more detailed demo [here](record_demo).
