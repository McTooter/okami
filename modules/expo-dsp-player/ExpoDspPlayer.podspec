Pod::Spec.new do |s|
  s.name           = 'ExpoDspPlayer'
  s.version        = '1.0.0'
  s.summary        = 'Sphynx local-file DSP playback module.'
  s.description    = 'An Expo Modules bridge for Sphynx AVAudioEngine DSP playback.'
  s.license        = { :type => 'MIT' }
  s.authors        = { 'Sphynx' => 'engineering@sphynx.local' }
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => 'https://example.invalid/sphynx-local-module.git', :tag => s.version.to_s }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = 'ios/**/*.{swift,h,m,mm}'
  s.swift_version = '5.9'
end
