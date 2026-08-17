import AVFAudio
import ExpoModulesCore

public final class ExpoAudioRouteModule: Module {
  private let notificationCenter = NotificationCenter.default
  private var routeChangeObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("ExpoAudioRoute")

    Events("onAudioRouteChange")

    AsyncFunction("getCurrentRouteAsync") { [weak self] () -> [String: Any] in
      self?.currentRoutePayload() ?? ["kind": "unknown", "name": ""]
    }

    OnStartObserving("onAudioRouteChange") {
      self.startObservingRouteChanges()
    }

    OnStopObserving("onAudioRouteChange") {
      self.stopObservingRouteChanges()
    }

    OnDestroy {
      self.stopObservingRouteChanges()
    }
  }

  private func currentRoutePayload() -> [String: Any] {
    let output = AVAudioSession.sharedInstance().currentRoute.outputs.first
    guard let output else {
      return ["kind": "unknown", "name": ""]
    }

    return [
      "kind": routeKind(for: output.portType),
      "name": output.portName
    ]
  }

  private func routeKind(for port: AVAudioSession.Port) -> String {
    switch port {
    case .bluetoothA2DP, .bluetoothHFP, .bluetoothLE:
      return "bluetooth"
    case .headphones, .lineOut, .usbAudio, .carAudio:
      return "wired"
    case .airPlay:
      return "airplay"
    case .builtInSpeaker:
      return "speaker"
    case .builtInReceiver:
      return "receiver"
    default:
      return "unknown"
    }
  }

  private func startObservingRouteChanges() {
    guard routeChangeObserver == nil else { return }

    routeChangeObserver = notificationCenter.addObserver(
      forName: AVAudioSession.routeChangeNotification,
      object: AVAudioSession.sharedInstance(),
      queue: .main
    ) { [weak self] _ in
      guard let self else { return }
      self.sendEvent("onAudioRouteChange", ["route": self.currentRoutePayload()])
    }

    try? AVAudioSession.sharedInstance().setActive(true, options: [])
  }

  private func stopObservingRouteChanges() {
    guard let routeChangeObserver else { return }
    notificationCenter.removeObserver(routeChangeObserver)
    self.routeChangeObserver = nil
  }
}
