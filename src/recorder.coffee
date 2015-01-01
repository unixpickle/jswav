class Recorder
  constructor: ->
    @onDone = null
    @onError = null
    @onStart = null
    @_buffers = []
    @_sampleCount = 0
    @_sampleRate = 0
    @_stopped = false
    @_stream = null
  
  start: ->
    getUserMedia (err, stream) =>
      if @_stopped
        stream.stop()
        @onDone?()
        return
      return @onError? err if err?
      @_stream = stream
      @_handleStream()
  
  stop: ->
    @_stopped = true
    @_stream.stop() if @_stream?
  
  _handleStream: ->
    AudioContext = window.AudioContext or window.webkitAudioContext
    context = new AudioContext()
    source = context.createMediaStreamSource @_stream
    processor = context.createScriptProcessor 1024, 1, 1
    processor.onaudioprocess = (evt) =>
      if @_sampleRate is 0
        @_sampleRate = Math.round evt.inputBuffer.sampleRate
      data = evt.inputBuffer.getChannelData(0)
      @_buffers.push copyBuffer(data)
      @_sampleCount += data.length
      evt.outputBuffer = evt.inputBuffer
    source.connect processor
    processor.connect context.destination
    @_stream.onended = =>
      source.disconnect processor
      processor.disconnect context.destination
      @onDone @_generateSound() if @onDone?
    @onStart?()
  
  _generateSound: ->
    # Create all the buffer info
    size = 44 + @_sampleCount*2
    buffer = new ArrayBuffer size
    view = new DataView buffer
    # Write the actual data
    window.jswav.Sound._setupHeader view, @_sampleCount, @_sampleRate
    byteIdx = 44
    for subList in @_buffers
      for x in subList
        view.setInt16 byteIdx, Math.round(x*0x8000), true
        byteIdx += 2
    # Return the result
    return new window.jswav.Sound buffer, view

copyBuffer = (buffer) ->
  res = new Float32Array buffer.length
  for x, i in buffer
    res[i] = x
  return res

getUserMedia = (cb) ->
  keys = ['getUserMedia', 'webkitGetUserMedia', 'mozGetUserMedia',
    'msGetUserMedia']
  gum = null
  for key in keys
    break if (gum = navigator[key])?
  if not gum?
    setTimeout (-> cb 'getUserMedia unavailable', null), 10
    return
  gum.call navigator, {audio: true, video: false},
    (stream) ->
      cb null, stream
    (err) ->
      if err?
        cb err, null
      else
        cb 'Unknown error', null

window.jswav = {} if not window.jswav?
window.jswav.Recorder = Recorder