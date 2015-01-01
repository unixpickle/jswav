class Sound
  constructor: (@buffer, @view) ->
  
  averageSamples: (start, end) ->
    sum = 0
    for i in [start...end]
      sum += Math.abs @getSample i
    return sum / (end - start)
  
  base64: ->
    binary = ''
    bytes = new Uint8Array @buffer
    for x in bytes
      binary += String.fromCharCode x
    return window.btoa binary
  
  crop: (start, end) ->
    maximum = view.getUint32(40) / 2
    rate = view.getUint32 24
    startIdx = Math.max 0, Math.min(start*rate, maximum)
    endIdx = Math.max 0, Math.min(end*rate, maximum)
    sampleCount = endIdx-startIdx
    # Create buffer and view
    size = 44 + sampleCount*2
    buffer = new ArrayBuffer size
    view = new DataView buffer
    # Write the actual data
    Sound._setupHeader view, sampleCount, sampleRate
    dest = 44
    for source in [startIdx*2...endIdx*2]
      view.setUint8 dest, oldView.getUint8(source)
      ++dest
    # Return the result
    return new Sound buffer, view
  
  getDuration: ->
    return @getSampleCount() / @getSampleRate()
  
  getSample: (idx) ->
    return @view.getInt16(44 + idx*2, true) / 0x8000
  
  getSampleCount: ->
    return @view.getUint32(40, true) / 2
  
  getSampleRate: ->
    return @view.getUint32 24, true
  
  volumeAverages: (count) ->
    total = @getSampleCount()
    perAverage = total / count
    res = []
    for i in [0...count]
      start = Math.floor i * total / count
      end = start + Math.floor total / count
      end = total if end > total
      res.push @averageSamples start, end
    return res
  
  @fromBase64: (b64) ->
    raw = window.atob b64
    buffer = new ArrayBuffer raw.length
    bytes = new Uint8Array buffer
    for i in [0...raw.length]
      bytes[i] = raw.charCodeAt i
    view = new DataView buffer
    return new Sound buffer, view
  
  @_setupHeader: (view, sampleCount, sampleRate) ->
    size = 44 + sampleCount*2
    view.setUint32 0, 0x46464952, true
    view.setUint32 4, size-8, true
    view.setUint32 8, 0x45564157, true
    view.setUint32 12, 0x20746d66, true
    view.setUint32 16, 0x10, true
    view.setUint16 20, 1, true
    view.setUint16 22, 1, true
    view.setUint32 24, sampleRate, true
    view.setUint32 28, sampleRate*2, true
    view.setUint16 32, 2, true
    view.setUint16 34, 16, true
    view.setUint32 36, 0x61746164, true
    view.setUint32 40, sampleCount*2, true

window.jswav = {} if not window.jswav?
window.jswav.Sound = Sound