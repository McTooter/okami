import AVFAudio
import AudioToolbox
import ExpoModulesCore

public final class ExpoDspPlayerModule: Module {
  private let engine = AVAudioEngine()
  private let playerNode = AVAudioPlayerNode()
  private let timePitch = AVAudioUnitTimePitch()
  private let equalizer = AVAudioUnitEQ(numberOfBands: 5)
  private let dynamics: AVAudioUnitEffect = {
    let component = AudioComponentDescription(
      componentType: kAudioUnitType_Effect,
      componentSubType: kAudioUnitSubType_DynamicsProcessor,
      componentManufacturer: kAudioUnitManufacturer_Apple,
      componentFlags: 0,
      componentFlagsMask: 0
    )
    return AVAudioUnitEffect(audioComponentDescription: component)
  }()
  private let frequencies: [Float] = [60, 230, 910, 3600, 14000]
  private let statusQueue = DispatchQueue(label: "im.sphynx.dsp.status")
  private var statusTimer: DispatchSourceTimer?
  private var file: AVAudioFile?
  private var scheduledFrame: AVAudioFramePosition = 0
  private var loaded = false
  private var playing = false
  private var repeatOne = false
  private var durationSeconds: Double = 0

  public func definition() -> ModuleDefinition {
    Name("ExpoDspPlayer")

    Events("onPlaybackStatus")

    OnCreate {
      self.configureGraph()
    }

    AsyncFunction("loadAsync") { [weak self] (uri: String, configuration: [String: Any]) -> [String: Any] in
      guard let self else { throw DspPlayerError.unavailable }
      try self.load(uri: uri, configuration: configuration)
      return self.statusPayload()
    }

    AsyncFunction("configureAsync") { [weak self] (configuration: [String: Any]) -> [String: Any] in
      guard let self else { throw DspPlayerError.unavailable }
      self.apply(configuration: configuration)
      return self.statusPayload()
    }

    AsyncFunction("playAsync") { [weak self] () -> [String: Any] in
      guard let self else { throw DspPlayerError.unavailable }
      try self.play()
      return self.statusPayload()
    }

    AsyncFunction("pauseAsync") { [weak self] () -> [String: Any] in
      guard let self else { throw DspPlayerError.unavailable }
      self.pause()
      return self.statusPayload()
    }

    AsyncFunction("seekAsync") { [weak self] (seconds: Double) -> [String: Any] in
      guard let self else { throw DspPlayerError.unavailable }
      try self.seek(seconds: seconds)
      return self.statusPayload()
    }

    AsyncFunction("getStatusAsync") { [weak self] () -> [String: Any] in
      self?.statusPayload() ?? Self.emptyStatus()
    }

    AsyncFunction("unloadAsync") { [weak self] () in
      self?.unload()
    }

    OnDestroy {
      self.unload()
    }
  }

  private func configureGraph() {
    engine.attach(playerNode)
    engine.attach(timePitch)
    engine.attach(equalizer)
    engine.attach(dynamics)
    engine.connect(playerNode, to: timePitch, format: nil)
    engine.connect(timePitch, to: equalizer, format: nil)
    engine.connect(equalizer, to: dynamics, format: nil)
    engine.connect(dynamics, to: engine.mainMixerNode, format: nil)

    for (index, band) in equalizer.bands.enumerated() {
      band.filterType = .parametric
      band.frequency = frequencies[index]
      band.bandwidth = 1.0
      band.gain = 0
      band.bypass = false
    }
    equalizer.globalGain = 0
    timePitch.rate = 1
    dynamics.bypass = true
  }

  private func load(uri: String, configuration: [String: Any]) throws {
    unload()
    let url = URL(string: uri)?.isFileURL == true ? URL(string: uri)! : URL(fileURLWithPath: uri)
    let audioFile = try AVAudioFile(forReading: url)
    file = audioFile
    durationSeconds = Double(audioFile.length) / audioFile.processingFormat.sampleRate
    scheduledFrame = 0
    loaded = true
    apply(configuration: configuration)

    let session = AVAudioSession.sharedInstance()
    try session.setCategory(.playback, mode: .default, options: [.allowBluetoothA2DP, .allowAirPlay])
    try session.setActive(true, options: [])
    engine.prepare()
    try engine.start()
    scheduleFromCurrentFrame()
    startStatusTimer()
  }

  private func apply(configuration: [String: Any]) {
    let eq = (configuration["eq"] as? [NSNumber] ?? []).map { $0.floatValue }
    for (index, band) in equalizer.bands.enumerated() {
      band.gain = clamped(eq[safe: index] ?? 0, lower: -12, upper: 12)
      band.bypass = false
    }

    equalizer.globalGain = clamped(number(configuration["preamp"]), lower: -6, upper: 6)
    engine.mainMixerNode.outputVolume = linearGain(fromDb: clamped(number(configuration["outputTrim"]), lower: -12, upper: 0))
    timePitch.rate = clamped(number(configuration["playbackRate"], fallback: 1), lower: 0.5, upper: 2)
    repeatOne = configuration["repeatOne"] as? Bool ?? false

    let limiter = configuration["limiter"] as? Bool ?? false
    let compressor = configuration["compressor"] as? Bool ?? false
    let loudnessMode = configuration["loudnessMode"] as? String ?? "off"
    let loudnessEnabled = loudnessMode == "track" || loudnessMode == "album"
    dynamics.bypass = !(limiter || compressor || loudnessEnabled)

    if limiter {
      configureDynamics(threshold: -4, headRoom: 1, attack: 0.001, release: 0.08, overallGain: 0)
    } else if loudnessEnabled {
      configureDynamics(
        threshold: loudnessMode == "track" ? -20 : -18,
        headRoom: compressor ? 3.5 : 5,
        attack: 0.01,
        release: 0.18,
        overallGain: loudnessMode == "track" ? 3 : 1.5
      )
    } else if compressor {
      configureDynamics(threshold: -18, headRoom: 4, attack: 0.01, release: 0.15, overallGain: 0)
    }
  }

  private func play() throws {
    guard loaded else { throw DspPlayerError.noTrack }
    if !engine.isRunning { try engine.start() }
    if !playerNode.isPlaying { playerNode.play() }
    playing = true
    emitStatus()
  }

  private func pause() {
    guard loaded else { return }
    scheduledFrame = currentFrame()
    playerNode.pause()
    playing = false
    emitStatus()
  }

  private func seek(seconds: Double) throws {
    guard let file else { throw DspPlayerError.noTrack }
    let frame = AVAudioFramePosition(max(0, min(seconds, durationSeconds)) * file.processingFormat.sampleRate)
    let wasPlaying = playing
    playerNode.stop()
    scheduledFrame = frame
    scheduleFromCurrentFrame()
    if wasPlaying { playerNode.play() }
    emitStatus()
  }

  private func scheduleFromCurrentFrame() {
    guard let file else { return }
    let remainingFrames = max(0, file.length - scheduledFrame)
    guard remainingFrames > 0 else { return }
    playerNode.scheduleSegment(file, startingFrame: scheduledFrame, frameCount: AVAudioFrameCount(remainingFrames), at: nil, completionCallbackType: .dataPlayedBack) { [weak self] _ in
      DispatchQueue.main.async {
        guard let self else { return }
        if self.repeatOne {
          self.scheduledFrame = 0
          self.scheduleFromCurrentFrame()
          if self.playing { self.playerNode.play() }
        } else {
          self.playing = false
          self.scheduledFrame = self.file?.length ?? 0
          self.emitStatus(didJustFinish: true)
        }
      }
    }
  }

  private func currentFrame() -> AVAudioFramePosition {
    guard playing,
          let nodeTime = playerNode.lastRenderTime,
          let playerTime = playerNode.playerTime(forNodeTime: nodeTime) else {
      return scheduledFrame
    }
    return max(0, min(scheduledFrame + playerTime.sampleTime, file?.length ?? 0))
  }

  private func statusPayload(didJustFinish: Bool = false) -> [String: Any] {
    let frame = loaded ? currentFrame() : 0
    let sampleRate = file?.processingFormat.sampleRate ?? 1
    return [
      "currentTime": Double(frame) / sampleRate,
      "duration": durationSeconds,
      "playing": playing,
      "didJustFinish": didJustFinish,
      "engineActive": engine.isRunning,
      "processingActive": !dynamics.bypass || equalizer.bands.contains { $0.gain != 0 } || equalizer.globalGain != 0
    ]
  }

  private func emitStatus(didJustFinish: Bool = false) {
    sendEvent("onPlaybackStatus", ["status": statusPayload(didJustFinish: didJustFinish)])
  }

  private func startStatusTimer() {
    statusTimer?.cancel()
    let timer = DispatchSource.makeTimerSource(queue: .main)
    timer.schedule(deadline: .now(), repeating: .milliseconds(250))
    timer.setEventHandler { [weak self] in
      self?.emitStatus()
    }
    statusTimer = timer
    timer.resume()
  }

  private func unload() {
    statusTimer?.cancel()
    statusTimer = nil
    playerNode.stop()
    engine.stop()
    file = nil
    scheduledFrame = 0
    durationSeconds = 0
    loaded = false
    playing = false
  }

  private func number(_ value: Any?, fallback: Float = 0) -> Float {
    if let number = value as? NSNumber { return number.floatValue }
    return fallback
  }

  private func clamped(_ value: Float, lower: Float, upper: Float) -> Float {
    return min(upper, max(lower, value))
  }

  private func linearGain(fromDb value: Float) -> Float {
    return powf(10, value / 20)
  }

  private func configureDynamics(
    threshold: Float,
    headRoom: Float,
    attack: Float,
    release: Float,
    overallGain: Float
  ) {
    setDynamicsParameter(kDynamicsProcessorParam_Threshold, value: threshold)
    setDynamicsParameter(kDynamicsProcessorParam_HeadRoom, value: headRoom)
    setDynamicsParameter(kDynamicsProcessorParam_AttackTime, value: attack)
    setDynamicsParameter(kDynamicsProcessorParam_ReleaseTime, value: release)
    setDynamicsParameter(kDynamicsProcessorParam_OverallGain, value: overallGain)
  }

  private func setDynamicsParameter(_ parameter: AudioUnitParameterID, value: Float) {
    let status = AudioUnitSetParameter(
      dynamics.audioUnit,
      parameter,
      kAudioUnitScope_Global,
      0,
      AudioUnitParameterValue(value),
      0
    )
    if status != noErr {
      NSLog("Okami DSP could not set dynamics parameter %u (status %d).", parameter, status)
    }
  }

  private static func emptyStatus() -> [String: Any] {
    return ["currentTime": 0, "duration": 0, "playing": false, "engineActive": false, "processingActive": false]
  }
}

private enum DspPlayerError: Error, LocalizedError {
  case noTrack
  case unavailable

  var errorDescription: String? {
    switch self {
    case .noTrack: return "No local track has been loaded into the Okami DSP player."
    case .unavailable: return "The Okami DSP player is unavailable."
    }
  }
}

private extension Array {
  subscript(safe index: Int) -> Element? {
    indices.contains(index) ? self[index] : nil
  }
}
