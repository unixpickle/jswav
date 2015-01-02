# jswav

**jswav** is a dead-simple JavaScript API for dealing with microphone input and WAV audio data.

# Format support

Currently, **jswav** only supports 8-bit and 16-bit PCM.

# Usage

First, import `jswav.js` with a `<script>` tag:

    <script src="jswav.js" type="text/javascript"></script>

You can record WAV data straight from the microphone using a `Recorder`. Here is how:

    recording = new window.jswav.Recorder();
    recording.ondone = function(sound) {
        // Do something with `sound`, for example save it and download it using
        // sound.base64() which returns a base64 WAV file.
    };
    recording.onerror = function(err) {
        // The recording could not be started
    };
    recording.start();

There is a more detailed demo [here](record_demo).
