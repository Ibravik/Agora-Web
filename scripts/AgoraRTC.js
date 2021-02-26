/**
 * @brief   API log detail level.
 */
const eLOG_LVL = {
  kDebug: 0,
  kInfo: 1,
  kWarning: 2,
  kError: 3,
  kNone: 4,
};

/**
 * @brief   The different hardware devices that agora recognize.
 */
const eDEVICE_TYPE = {
  kVideoRecording: 1,
  kAudioRecording: 2,
  kAudioPlayback: 3
};

/**
 * @brief   The roles that the client can have in the channel
 */
const eCLIENT_ROLE = {
  kBROADCASTER: "host",
  kAUDIENCE: "audience"
};

/**
 * @brief   The available settings to mantain quality in the call
 */
const eDEGRADATION_PREFERENCE = {
  kQUALITY: "detail",
  kFRAMERATE: "motion",
  kBALANCED: "balanced",
};

/**
 * @brief   The current video that feeds the video stream
 */
const eVIDEO_FEED = {
  kCAMERA: "camera",
  kSCREEN: "screen"
};

/**
 * @brief   The video fit in local html obj
 */
const eLOCAL_VIDEO_FIT = {
  kCOVER: "cover",
  kCONTAIN: "contain",
  kFILL: "fill"
};

/**
 * @brief   The current video that feeds the video stream
 */
const eENCRYPTION_TYPE = {
  kAES_128_XTS: "aes-128-xts",
  kAES_256_xts: "aes-256-xts",
  kAES_128_ECB: "aes-128-ecb",
  kSM4_128_ECB: "sm4-128-ecb",
  kNONE: "none"
};

/**
 * @brief   Remote video stream types.
 */
const eREMOTE_VIDEO_QUALITY = {
  kHIGH: 0,
  kLOW: 1
};

/**
 * @brief   This just help to handle the info of the SDK.
 */
var _rtcEngine = {
  logLvl: eLOG_LVL.kDebug,
  client: null,
  audioRecordignVolume: 500,
  videoFeed: eVIDEO_FEED.kCAMERA,
  muteVideo: false,
  muteAudio: false
};

/**
 * @brief   Local sampler tracks.
 */
var _LocalTracks = {
  screenVideoTrack: null,
  screenAudioTrack: null,
  videoTrack: null,
  audioTrack: null
};

/**
 * @brief   Remote sampler tracks.
 */
var _remoteTracks = {};

/**
 * @brief   Client settings.
 */
var _ClientSettings = {
  codec: "h264",  //"vp8" | "h264"
  mode: "live",   //"live" | "rtc"
  role: eCLIENT_ROLE.kBROADCASTER
}

/**
 * @brief   The settings to join to a channel.
 */
var _ChannelSettings = {
  channelName: "",
  encryptionKey: "",
  encryptionType: "aes-128-xts",//"aes-128-xts" | "aes-256-xts" | "aes-128-ecb" | "sm4-128-ecb" | "none"
  clientID: 0
}

/**
 * @brief   The local video play configurations
 */
var _LocalVideoPlayConfig = {
  fit: eLOCAL_VIDEO_FIT.kCOVER,
  mirror: false,
  localPlayObj: null
}

/**
 * @brief   The video encoder config for the used in channel connection.
 */
var _VideoEncoderConfig = {
  /**
   * @brief   The following table lists the recommended video encoder configurations, where the
   *          base bitrate applies to the `COMMUNICATION` profile. Set your bitrate based on
   *          this table. If you set a bitrate beyond the proper range, the SDK automatically
   *          sets it to within the range.
   */

  /*
  | Resolution  | Frame Rate (fps) | Live Bitrate (Kbps) |
  |-------------|------------------|---------------------|
  | 160 * 120   | 15               | 130                 |
  | 120 * 120   | 15               | 100                 |
  | 320 * 180   | 15               | 280                 |
  | 180 * 180   | 15               | 200                 |
  | 240 * 180   | 15               | 240                 |
  | 320 * 240   | 15               | 400                 |
  | 240 * 240   | 15               | 280                 |
  | 424 * 240   | 15               | 440                 |
  | 640 * 360   | 15               | 800                 |
  | 360 * 360   | 15               | 520                 |
  | 640 * 360   | 30               | 1200                |
  | 360 * 360   | 30               | 800                 |
  | 480 * 360   | 15               | 640                 |
  | 480 * 360   | 30               | 980                 |
  | 640 * 480   | 15               | 1000                |
  | 480 * 480   | 15               | 800                 |
  | 640 * 480   | 30               | 1500                |
  | 480 * 480   | 30               | 1200                |
  | 848 * 480   | 15               | 1220                |
  | 848 * 480   | 30               | 1860                |
  | 640 * 480   | 10               | 800                 |
  | 1280 * 720  | 15               | 2260                |
  | 1280 * 720  | 30               | 3420                |
  | 960 * 720   | 15               | 1820                |
  | 960 * 720   | 30               | 2760                |
  | 1920 * 1080 | 15               | 4160                |
  | 1920 * 1080 | 30               | 6300                |
  | 1920 * 1080 | 60               | 6500                |
  | 2560 * 1440 | 30               | 6500                |
  | 2560 * 1440 | 60               | 6500                |
  | 3840 * 2160 | 30               | 6500                |
  | 3840 * 2160 | 60               | 6500                |
  */

  screenConfig: {
    bitrateMax: 4500,
    bitrateMin: 4000,
    frameRate: 10,
    height: 1080,
    width: 1920,
    degradationPreference: eDEGRADATION_PREFERENCE.kQUALITY
  },
  highConfig: {
    bitrateMax: 800,
    bitrateMin: 500,
    frameRate: 15,
    height: 480,
    width: 640,
    degradationPreference: eDEGRADATION_PREFERENCE.kBALANCED
  },
  lowConfig: {
    bitrate: 140,
    framerate: 7,
    height: 180,
    width: 320
  },
};

/**
 * @brief   The audio encoder config for the used in channel connection.
 */
var _AudioEncoderConfig = {
  bitrate: 128,
  sampleRate: 32000,
  //sampleSize: 128,
  stereo: false,
  AEC: false,//echo
  AGC: false,//gain
  ANS: false,//noise
};

/**
 * @brief   The injected URL stream encoder config for the used in channel connection.
 */
var _URLEncoderConfig = {
  audioBitrate: 128,
  audioChannels: 1,
  audioSampleRate: 32000,
  audioVolume: 500,
  height: 1080,
  videoBitrate: 4500,
  videoFramerate: 15,
  videoGop: 30,
  width: 1920,
};

/**
 * @brief   Wrapper log system.
 * @param   #String: The log msg.
 * @param   #String: The log msg.
 * @bug     No know Bugs.
 */
function _Log(_msg, _logType)
{
  if (_rtcEngine.logLvl != eLOG_LVL.kNone)
  {
    let string;
    let stringColor;

    switch (_logType)
    {
      case eLOG_LVL.kDebug:
        string = "Agora-Wrapper [DEBUG]:";
        stringColor = "#44f";
        break;
      case eLOG_LVL.kInfo:
        string = "Agora-Wrapper [INFO]:";
        stringColor = "#999";
        break;
      case eLOG_LVL.kWarning:
        string = "Agora-Wrapper [WARNING]:";
        stringColor = "#ff0";
        break;
      case eLOG_LVL.kError:
        string = "Agora-Wrapper [ERROR]:";
        stringColor = "#f00";
        break;
      default:
        string = "Agora-Wrapper [MESSAGE]:";
        stringColor = "#fff";
        break;
    };

    console.log("%c" + string, "color:" + stringColor, _msg);
  }
}

/**
 * @brief   Current active audio track.
 * @bug     No know Bugs.
 * @return  #Object: Local audio track object.
 */
function _GetAudioTrack()
{
  if (_rtcEngine.videoFeed == eVIDEO_FEED.kCAMERA)
  {
    return _LocalTracks.audioTrack;
  }
  else if (_rtcEngine.videoFeed == eVIDEO_FEED.kSCREEN)
  {
    return _LocalTracks.screenAudioTrack;
  }
  return null;
}

/**
 * @brief   Current active video track.
 * @bug     No know Bugs.
 * @return  #Object: Local video track object.
 */
function _GetVideoTrack()
{
  if (_rtcEngine.videoFeed == eVIDEO_FEED.kCAMERA)
  {
    return _LocalTracks.videoTrack;
  }
  else if (_rtcEngine.videoFeed == eVIDEO_FEED.kSCREEN)
  {
    return _LocalTracks.screenVideoTrack;
  }
  return null;
}

/**
 * @brief   Initialize the agora engine and all the needed components too.
 * @param   #eLOG_LVL: The log level to use the api.
 * @param   #Function: Succest callback().
 * @bug     No know Bugs.
 */
function StartUp(_logLvl, _callback)
{
  // set log level for the app
  AgoraRTC.setLogLevel(_logLvl);
  
  // create client
  _rtcEngine.client = AgoraRTC.createClient(_ClientSettings);

  // enable the dual stream mode
  _rtcEngine.client.enableDualStream();

  // Bind the track publishing to the client 
  _rtcEngine.client.on("user-published", 
  function (_user, _mediaType)
  {
    _remoteTracks[_user.uid] = _user;

    _rtcEngine.client.subscribe(_user, _mediaType).then(
    function () 
    {
      if (_mediaType == "audio") 
      {
        _remoteTracks[_user.uid].audioTrack.play();
      }
    }).catch(
    function (_error)
    {
      _Log(_error, eLOG_LVL.kError);
    });
  });
  _rtcEngine.client.on("user-unpublished", 
  async function (_user)
  {
    delete _remoteTracks[_user.uid];
  });

  if (_callback)
  {
    _callback();
  }
  _rtcEngine.logLvl = _logLvl;
  _Log(_rtcEngine);
}

/**
 * @brief   Current used sdk ver.
 * @bug     No know Bugs.
 * @return  #String: The current version of the sdk.
 */
function GetSDKVersion()
{
  return AgoraRTC.VERSION;
}

/**
 * @brief   True if the agora system is ready to rumble.
 * @bug     No know Bugs.
 * @return  #Boolean: true if the m_RtcEngine are ready.
 */
function GetStatus()
{
  return _rtcEngine.client != null;
}

/**
 * @brief   Create an array with the available devices according to the device type param
 * @param   #eDEVICE_TYPE: the desire device type to use in the search.
 * @bug     No know Bugs.
 * @return  #std::vector<std::string>: The device name list.
 */
//std::vector<std::string> GetDeviceList(const eDEVICE_TYPE _deviceType);

/**
 * @brief   Device ID from the device name according to the device type param.
 * @param   #FString: The device name.
 * @param   #eDEVICE_TYPE: the desire device type to use in the search.
 * @bug     No know Bugs.
 * @return  #std::string: The device ID.
 */
//std::string GetDeviceID(const std::string& _deviceName, const eDEVICE_TYPE _deviceType);

/**
 * @brief   Device NAME from the device id according to the device type param.
 * @param   #FString: The device ID.
 * @param   #eDEVICE_TYPE: the desire device type to use in the search.
 * @bug     No know Bugs.
 * @return  #std::string: The device NAME.
 */
//std::string GetDeviceName(const std::string& _deviceID, const eDEVICE_TYPE _deviceType);

/**
 * @brief   Current used device name.
 * @param   #eDEVICE_TYPE: the desire device type to use in the search.
 * @bug     No know Bugs.
 * @return  #String: Current set device name.
 */
function GetCurrentDevice(_deviceType)
{
  if (_deviceType == eDEVICE_TYPE.kVideoRecording)
  {
    if (_GetVideoTrack() != null)
    {
      return _GetVideoTrack()._deviceName;
    }
  }
  else if (_deviceType == eDEVICE_TYPE.kAudioRecording)
  {
    if (_GetAudioTrack() != null)
    {
      return _GetAudioTrack()._deviceName;
    }
  }
  return "Not Set"
}

/**
 * @brief   Current audio recording volume(only in ).
 * @bug     No know Bugs.
 * @return  #float: The audio recording  device Volume(0.0f - 1.0f).
 */
function GetAudioRecordingVolume()
{
  if (_GetAudioTrack() != null)
  {
    return _GetAudioTrack().getVolumeLevel();
  }
  return _rtcEngine.audioRecordignVolume;
}

/**
 * @brief   Current audio playback volume.
 * @bug     No know Bugs.
 * @return  #float: The audio Playback device Volume(0.0 - 1.0).
 */
//float GetAudioPlaybackVolume() const;


/**
 * @brief   Set a different device to be used by agora by id.
 * @param   #FString: The device ID.
 * @param   #eDEVICE_TYPE: the desire device type to use in the search.
 * @bug     No know Bugs.
 */
//int SetCurrentDeviceByID(const std::string& _deviceID, const eDEVICE_TYPE _deviceType);

/**
 * @brief   Set a different device to be used by agora by name.
 * @param   #FString: The device NAME.
 * @param   #eDEVICE_TYPE: the desire device type to use in the search.
 * @bug     No know Bugs.
 */
//int SetCurrentDeviceByName(const std::string& _deviceName, const eDEVICE_TYPE _deviceType);

/**
 * @brief   Set the current audio recording value.
 * @param   #Number: Volume lvl(0-1000).
 * @bug     No know Bugs.
 */
function SetAudioRecordingVolume(_volume)
{
  if (_GetAudioTrack() != null)
  {
    _GetAudioTrack().setVolume(_volume);
  }
  _rtcEngine.audioRecordignVolume = _volume;
  _Log(_rtcEngine);
}

/**
 * @brief   Set the current audio Playback value.
 * @param   #float: The current audio Playback volume(0.0 - 1.0).
 * @bug     No know Bugs.
 */
//int SetAudioPlaybackVolume(const float _volume) const;

/**
 * @brief   The parameters specified in this method are the maximum values under ideal
 *          network conditions. If the video engine cannot render the video using the
 *          specified parameters due to poor network conditions, the parameters further
 *          down the list are considered until a successful configuration is found.
 * @param   #Object: Encoder config { bitrateMax(Number), bitrateMin(Number), 
 *                                    frameRate(Number), height(Number), width(Number), 
 *                                    degradationPreference(eDEGRADATION_PREFERENCE)}.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
async function SetHighVideoEncoderConfiguration(_encoderConfig, _callback)
{
  if (_LocalTracks.videoTrack != null)
  {
    await _LocalTracks.videoTrack.setEncoderConfiguration(_encoderConfig);
    await _LocalTracks.videoTrack.setOptimizationMode(_encoderConfig.degradationPreference);
  }

  if (_callback)
  {
    _callback();
  }
  _VideoEncoderConfig.highConfig = _encoderConfig;
  _Log(_VideoEncoderConfig.highConfig);
}

/**
 * @brief   The parameters specified in this method are the minimum values under ideal
 *          network conditions. If the video engine cannot render the video using the
 *          specified parameters due to poor network conditions, the parameters further
 *          down the list are considered until a successful configuration is found.
 * @param   #Object: Encoder config { bitrate(Number), framerate(Number), height(Number), 
 *                                    width(Number), degradationPreference(eDEGRADATION_PREFERENCE) }.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
async function SetLowVideoEncoderConfiguration(_encoderConfig, _callback)
{ 
  if (_rtcEngine.client != null)
  {
    // unpublish the published items
    if (_LocalTracks.videoTrack != null)
    {
      await _rtcEngine.client.unpublish(_LocalTracks.videoTrack);
    }
    
    // change settings
    _rtcEngine.client.setLowStreamParameter(_encoderConfig);

    // publish the published items
    if (_LocalTracks.videoTrack != null)
    {
      _rtcEngine.client.publish(_LocalTracks.videoTrack);
      _LocalTracks.videoTrack.setEnabled(!_rtcEngine.muteVideo);
    }
  }

  if (_callback)
  {
    _callback();
  }
  _VideoEncoderConfig.lowConfig = _encoderConfig;
  _Log(_VideoEncoderConfig.lowConfig);
}

/**
 * @brief   Updates the screen sharing parameters.
 * @param   #Object: the encoder config { bitrateMax(Number), bitrateMin(Number), 
 *                                        frameRate(Number), height(Number), width(Number), 
 *                                        degradationPreference(eDEGRADATION_PREFERENCE) }.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
async function SetScreenEncoderConfiguration(_encoderConfig, _callback)
{
  if (_LocalTracks.screenVideoTrack != null)
  {
    if (_LocalTracks.screenVideoTrack != null)
    {
      await _rtcEngine.client.unpublish(_LocalTracks.screenVideoTrack);
      _LocalTracks.screenVideoTrack.stop();
      _LocalTracks.screenVideoTrack.close();
      _LocalTracks.screenVideoTrack = null;
    }

    let screenConfig = {
      encoderConfig: _encoderConfig,
      optimizationMode: _encoderConfig.degradationPreference
    };

    [_LocalTracks.screenVideoTrack] = await Promise.all([
      AgoraRTC.createScreenVideoTrack(screenConfig)
    ]);
    if (_LocalTracks.screenVideoTrack != null)
    {
      await _rtcEngine.client.publish(_LocalTracks.screenVideoTrack);
      _LocalTracks.screenVideoTrack.setEnabled(!_rtcEngine.muteVideo);
    }
  }

  if (_callback)
  {
    _callback();
  }
  _VideoEncoderConfig.screenConfig = _encoderConfig;
  _Log(_VideoEncoderConfig.screenConfig);
}

/**
 * @brief   Sets the role of the user, such as a host or an audience (default), before/
 *          after joining a channel in a live broadcast.
 * @param   #eCLIENT_ROLE: New client role.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
async function SetClientRole(_clientRole, _callback)
{
  // avoid bad calls if the engine are not ready
  if (_rtcEngine.client == null)
  {
    return;
  }

  // get video track
  let videoTrack = _GetVideoTrack();
  let audioTrack = _GetAudioTrack();
   
  // handle the published streams and change role
  if (_clientRole == eCLIENT_ROLE.kAUDIENCE)
  {
    if (videoTrack)
    {
      await videoTrack.setEnabled(false);
    }
    if (audioTrack)
    {
      await audioTrack.setEnabled(false);
    }
    _rtcEngine.client.setClientRole(_clientRole);
  }
  else
  {
    _rtcEngine.client.setClientRole(_clientRole);
    if (videoTrack)
    {
      await videoTrack.setEnabled(!_rtcEngine.muteVideo);
    }
    if (audioTrack)
    {
      await audioTrack.setEnabled(!_rtcEngine.muteAudio);
    }
  }
  
  if (_callback)
  {
    _callback();
  }
  _ClientSettings.role = _clientRole;
  _Log(_ClientSettings);
}

/**
 * @brief   Change the remote video stream quality(low/high).
 * @param   #Number: The user ID.
 * @param   #eREMOTE_VIDEO_QUALITY: The video quality for the remote user.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
async function SetRemoteVideoQuality(_userID, _qualityType, _callback)
{
  // avoid bad calls if the engine are not ready
  if (_rtcEngine.client == null)
  {
    return;
  }

  if (_remoteTracks[_userID])
  {
    await _rtcEngine.client.setRemoteVideoStreamType(_userID, _qualityType);
  }

  if (_callback)
  {
    _callback();
  }
}

/**
 * @brief   Change the remote video stream priority(low/high).
 * @param   #unsigned int: The user ID.
 * @param   #eREMOTE_VIDEO_PRIORITY: The video priority for the remote user.
 * @bug     No know Bugs.
 */
//int SetRemoteVideoPriority(const unsigned int _userID, const eREMOTE_VIDEO_PRIORITY _priorityType) const;

/**
 * @brief   Set an audio effect to the audio stream.
 * @param   #eAUDIO_EFFECT: The Auto effect to apply to.
 * @bug     No know Bugs.
 */
//int SetAudioEffect(const eAUDIO_EFFECT _effect) const;

/**
 * @brief   Sets the camera capture configuration.
 * @param   #CameraCapturerConfig: Capture config for the camera.
 * @bug     No know Bugs.
 */
//int SetCameraCapturerConfiguration(const CameraCapturerConfig& _config) const;

/**
 * @brief   Set default remote video quality for all the user that enter to the channel.
 *          The default quality is Hight
 * @param   #eREMOTE_VIDEO_QUALITY: video quality types.
 * @bug     No know Bugs.
 */
//int SetDefaultRemoteVideoQuality(const eREMOTE_VIDEO_QUALITY _qualityType) const;

/**
 * @brief   Enable the super resolution video algorithm to specific user
 * @param   #unsigned int: The user ID.
 * @param   #bool: Enable flag.
 * @bug     No know Bugs.
 */
//int EnableRemoteVideoSuperResolution(const unsigned int _userID, const bool _switchFlag) const;

/**
 * @brief   Stop/Resume sharing the screen in the stream.
 * @param   #Boolean: The switch flag.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
async function EnableScreenShare(_switchFlag, _callback)
{
  // disable current video stream
  let videoTrack = _GetVideoTrack();
  let audioTrack = _GetAudioTrack();

  if (!videoTrack && !audioTrack)
  {
    _rtcEngine.videoFeed = (_switchFlag ? eVIDEO_FEED.kSCREEN : eVIDEO_FEED.kCAMERA);
    return;
  }

  if (videoTrack)
  {
    await _rtcEngine.client.unpublish(videoTrack);
    videoTrack.stop();
    videoTrack.close();
    videoTrack = null;
  }
  if (audioTrack)
  {
    await _rtcEngine.client.unpublish(audioTrack);
    audioTrack.stop();
    audioTrack.close();
    audioTrack = null;
  }

  // update feed flag
  _rtcEngine.videoFeed = (_switchFlag ? eVIDEO_FEED.kSCREEN : eVIDEO_FEED.kCAMERA);

  // prepare stream config
  let vidConfig = {
    cameraId: "",
    encoderConfig: _VideoEncoderConfig.highConfig,
    facingMode: "user",
    optimizationMode: _VideoEncoderConfig.highConfig.degradationPreference
  };
  let audioConfig = {
    microphoneId: "",
    AEC: _AudioEncoderConfig.AEC,
    AGC: _AudioEncoderConfig.AGC,
    ANS: _AudioEncoderConfig.ANS,
    encoderConfig: _AudioEncoderConfig
  };
  let screenConfig = {
    encoderConfig: _VideoEncoderConfig.screenConfig,
    optimizationMode: _VideoEncoderConfig.screenConfig.degradationPreference
  };
  
  // Create the local stream 
  if (_rtcEngine.videoFeed == eVIDEO_FEED.kCAMERA)
  {
    [_LocalTracks.videoTrack, _LocalTracks.audioTrack] = await Promise.all([
      AgoraRTC.createCameraVideoTrack(vidConfig),
      AgoraRTC.createMicrophoneAudioTrack(audioConfig)
    ]);
  }
  else if (_rtcEngine.videoFeed == eVIDEO_FEED.kSCREEN)
  {
    let tracks = null;
    [tracks] = await Promise.all([
      AgoraRTC.createScreenVideoTrack(screenConfig, "auto")
    ]);

    if (tracks && tracks.length && tracks.length > 1)
    {
      _LocalTracks.screenVideoTrack = tracks[0];
      _LocalTracks.screenAudioTrack = tracks[1];
    }
    else
    {
      _LocalTracks.screenVideoTrack = tracks;
      [_LocalTracks.screenAudioTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(audioConfig)
      ]);
    }
  }
  
  // publish local stream
  let track = _GetVideoTrack();
  if (track)
  {
    await _rtcEngine.client.publish(track);
    track.setEnabled(!_rtcEngine.muteVideo);
  }
  track = _GetAudioTrack();
  if (track)
  {
    track.setVolume(_rtcEngine.audioRecordignVolume);
    await _rtcEngine.client.publish(track);
    track.setEnabled(!_rtcEngine.muteAudio);
  }

  if (_callback)
  {
    _callback();
  }
}

/**
 * @brief   Stop/Resume sharing a window in the stream.
 * @param   #bool: The switch flag.
 * @param   #ScreenCaptureConfig: Config to capture the screen.
 * @bug     No know Bugs.
 */
//int EnableWindowShare(const bool _switchFlag, const ScreenCaptureConfig& _config);

/**
 * @brief   Stop/Resume local audio stream.
 * @param   #Boolean: The switch flag.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
async function MuteLocalAudioStream(_switchFlag, _callback)
{
  // enable stream if exist
  if (_GetAudioTrack() != null)
  {
    await _GetAudioTrack().setEnabled(!_switchFlag);
  }

  if (_callback)
  {
    _callback();
  }
  _rtcEngine.muteAudio = _switchFlag;
  _Log(_rtcEngine);
}

/**
 * @brief   Stop/Resume local video stream.
 * @param   #Boolean: The switch flag.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
async function MuteLocalVideoStream(_switchFlag, _callback)
{
  // enable stream if exist
  if (_GetVideoTrack() != null)
  {
    _GetVideoTrack().setEnabled(!_switchFlag).then(
    function () 
    {
      if(_callback)
      {
        _callback();
      }
    }).catch(
    function (_error)
    {
      _Log(_error, eLOG_LVL.kError);
    });
  }
  else
  {
    if(_callback)
    {
      _callback();
    }
  }

  _rtcEngine.muteVideo = _switchFlag;
  _Log(_rtcEngine);
}

/**
 * @brief   Stop/Resume remote audio stream from specific userID.
 * @param   #Number: The user ID.
 * @param   #Boolean: The switch flag.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
function MuteRemoteAudioStream(_userID, _switchFlag, _callback)
{
  // enable stream if exist
  if (_remoteTracks[_userID] &&
      _remoteTracks[_userID].audioTrack)
  {
    if (_switchFlag)
    {
      _remoteTracks[_userID].audioTrack.play();
    }
    else
    {
      _remoteTracks[_userID].audioTrack.stop();
    }
  }

  if (_callback)
  {
    _callback();
  }
}

/**
 * @brief   Stop/Resume remote video stream from specific userID.
 * @param   #Number: The user ID.
 * @param   #Boolean: The switch flag.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
//function MuteRemoteVideoStream(_userID, _switchFlag, _callback)

/**
 * @brief   Enable video recording feed test for the selected device.
 * @param   #bool: The switch flag.
 * @bug     No know Bugs.
 */
//int EnableVideoRecordingTest(const bool _switchFlag) const;

/**
 * @brief   Enable audio recording feed test for the selected device.
 * @param   #bool: The switch flag.
 * @bug     No know Bugs.
 */
//int EnableAudioRecordingTest(const bool _switchFlag) const;

/**
 * @brief   Join a channel with the specific params.
 * @param   #eDEVICE_TYPE: the desire device type to use in the search.
 * @param   #Object: Settings to Join a channel { channelName(String), encryptionKey(String),
 *                                                encryptionType(eENCRYPTION_TYPE), clientID(Number) }
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
async function JoinChannel(_settings, _callback = null)
{
  // avoid bad calls if the engine are not ready
  if (_rtcEngine.client == null)
  {
    return;
  }

  // set the encryption mode
  if (_settings.encryptionType && _settings.encryptionKey)
  {
    _rtcEngine.client.setEncryptionConfig(_settings.encryptionType, _settings.encryptionKey);
  }
                                          
  // turn on/off the volume indicator
  _rtcEngine.client.enableAudioVolumeIndicator();

  // set the channel client role
  _rtcEngine.client.setClientRole(_ClientSettings.role);
  
  // prepare stream config
  let vidConfig = {
    cameraId: "",
    encoderConfig: _VideoEncoderConfig.highConfig,
    facingMode: "user",
    optimizationMode: _VideoEncoderConfig.highConfig.degradationPreference
  };
  let audioConfig = {
    microphoneId: "",
    AEC: _AudioEncoderConfig.AEC,
    AGC: _AudioEncoderConfig.AGC,
    ANS: _AudioEncoderConfig.ANS,
    encoderConfig: _AudioEncoderConfig
  };
  let screenConfig = {
    encoderConfig: _VideoEncoderConfig.screenConfig,
    optimizationMode: _VideoEncoderConfig.screenConfig.degradationPreference
  };
  
  // set local video config
  await SetLowVideoEncoderConfiguration(_VideoEncoderConfig.lowConfig);

  // Create the local stream 
  if (_rtcEngine.videoFeed == eVIDEO_FEED.kCAMERA)
  {
    [_LocalTracks.videoTrack, _LocalTracks.audioTrack] = await Promise.all([
      AgoraRTC.createCameraVideoTrack(vidConfig),
      AgoraRTC.createMicrophoneAudioTrack(audioConfig)
    ]);
  }
  else if (_rtcEngine.videoFeed == eVIDEO_FEED.kSCREEN)
  {
    let tracks = null;
    [tracks] = await Promise.all([
      AgoraRTC.createScreenVideoTrack(screenConfig, "auto")
    ]);

    if (tracks && tracks.length && tracks.length > 1)
    {
      _LocalTracks.screenVideoTrack = tracks[0];
      _LocalTracks.screenAudioTrack = tracks[1];
    }
    else
    {
      _LocalTracks.screenVideoTrack = tracks;
      [_LocalTracks.screenAudioTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(audioConfig)
      ]);
    }
  }

  // Join to the channel
  [_ChannelSettings.clientID] = await Promise.all([
    _rtcEngine.client.join(appID, _settings.channelName, null, _settings.clientID)
  ]);
 
  // publish local stream
  let track = _GetVideoTrack();
  if (track)
  {
    await _rtcEngine.client.publish(track);
    track.setEnabled(!_rtcEngine.muteVideo);
  }
  track = _GetAudioTrack();
  if (track)
  {
    track.setVolume(_rtcEngine.audioRecordignVolume);
    await _rtcEngine.client.publish(track);
    track.setEnabled(!_rtcEngine.muteAudio);
  }
  
  if (_callback)
  {
    _callback(_ChannelSettings.clientID);
  }

  _ChannelSettings.channelName = _settings.channelName;
  _ChannelSettings.encryptionKey = _settings.encryptionKey;
  _ChannelSettings.encryptionType = _settings.encryptionType;
  _Log(_ChannelSettings);
}

/**
 * @brief   Leave the channel.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
async function LeaveChannel(_callback)
{
  // avoid bad calls if the engine are not ready
  if (_rtcEngine.client == null)
  {
    return;
  }

  // leave the channel
  await _rtcEngine.client.leave();

  // unpublish local stream
  if (_LocalTracks.videoTrack)
  {
    _LocalTracks.videoTrack.stop();
    _LocalTracks.videoTrack.close();
    _LocalTracks.videoTrack = null;
  }
  if (_LocalTracks.screenVideoTrack)
  {
    _LocalTracks.screenVideoTrack.stop();
    _LocalTracks.screenVideoTrack.close();
    _LocalTracks.screenVideoTrack = null;
  }
  if (_LocalTracks.audioTrack)
  {
    _LocalTracks.audioTrack.stop();
    _LocalTracks.audioTrack.close();
    _LocalTracks.audioTrack = null;
  }
  if (_LocalTracks.screenAudioTrack)
  {
    _LocalTracks.screenAudioTrack.stop();
    _LocalTracks.screenAudioTrack.close();
    _LocalTracks.screenAudioTrack = null;
  }
  
  if (_callback)
  {
    _callback();
  }
  _remoteTracks = {};
}

/**
 * @brief   Publishes the local stream to a specified CDN live RTMP address.  (CDN live only.)
 * @param   #std::string: The CDN streaming URL in the RTMP format. The maximum length of
 *          this parameter is 1024 bytes. The RTMP URL address must not contain special
 *          characters, such as Chinese language characters.
 * @param   #StreamConfig: The config to inject stream { audioBitrate(Number), audioChannels(Number),
 *                                                       audioSampleRate(Number), audioVolume(Number),
 *                                                       height(Number), videoBitrate(Number), 
 *                                                       videoFramerate(Number), videoGop(Number), width(Number) }
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
function PublishStreamUrl(_url, _config, _callback)
{
  // avoid bad calls if the engine are not ready
  if (_rtcEngine.client == null)
  {
    return;
  }

  _rtcEngine.client.addInjectStreamUrl(_url, _config).then(
  function () 
  {
    if(_callback)
    {
      _callback();
    }
  }).catch(
  function (_error)
  {
    _Log(_error, eLOG_LVL.kError);
  });
}

/**
 * @brief   Removes an RTMP stream from the CDN. (CDN live only.
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
function RemoveStreamUrl(_callback)
{
  // avoid bad calls if the engine are not ready
  if (_rtcEngine.client == null)
  {
    return;
  }

  _rtcEngine.client.removeInjectStreamUrl().then(
  function () 
  {
    if(_callback)
    {
      _callback();
    }
  }).catch(
  function (_error)
  {
    _Log(_error, eLOG_LVL.kError);
  });
}

/**
 * @brief   Return true if the API is compatible with the current browser and browser configuration.
 * @bug     No know Bugs.
 * @return  #Boolean: true if the browser is compatible.
 */
function GetCompatibilityStatus()
{
  return AgoraRTC.checkSystemRequirements();
}

/**
 * @brief   Set the local video play configuration to the local video feed.
 * @param   #Object: Local video play config { fit(eLOCAL_VIDEO_FIT), mirror(Boolean) }
 * @bug     No know Bugs.
 */
function SetLocalPlayConfiguration(_localPlayConfig)
{
  let track = _GetVideoTrack();
  if(track != null && track.isPlaying && _LocalVideoPlayConfig.localPlayObj != null)
  {
    track.stop();
    track.play(_LocalVideoPlayConfig.localPlayObj, _localPlayConfig);
  }
  _LocalVideoPlayConfig.fit = _localPlayConfig.fit;
  _LocalVideoPlayConfig.mirror = _localPlayConfig.mirror;
  _Log(_LocalVideoPlayConfig);
}

/**
 * @brief   Play local video feed.
 * @param   #string: HTML id obj to play the local feed.
 * @param   #Boolean: Switch flag.
 * @bug     No know Bugs.
 */
function EnableLocalVideo(_localVideo, _switchFlag)
{
  if(_GetVideoTrack() != null)
  {
    if (_switchFlag)
    {
      _GetVideoTrack().play(_localVideo, _LocalVideoPlayConfig);
    }
    else
    {
      _GetVideoTrack().stop();
    }
  }
  _LocalVideoPlayConfig.localPlayObj = _localVideo;
  _Log(_LocalVideoPlayConfig);
}

/**
 * @brief   Play remote video feed.
 * @param   #string: HTML id obj to play the local feed.
 * @param   #Number: The remote user ID.
 * @param   #Boolean: Switch flag.
 * @bug     No know Bugs.
 */
function EnableRemoteVideo(_remoteVideo, _userID, _switchFlag)
{
  if (_remoteTracks[_userID] && 
      _remoteTracks[_userID].videoTrack)
  {
    if (_switchFlag)
    {
      _remoteTracks[_userID].videoTrack.play(_remoteVideo, _LocalVideoPlayConfig);
    }
    else
    {
      _remoteTracks[_userID].videoTrack.stop();
    }
  }
}

/**
 * @brief   Set the configuration used for encoder audio recording in stream.
 * @param   #Object: Encoder config { bitrate(Number), sampleRate(Number), sampleSize(Number),
                                      stereo(Boolean), AEC(Boolean), AGC(Boolean), 
                                      ANS(Boolean) }
 * @param   #function: Succest callback().
 * @bug     No know Bugs.
 */
async function SetAudioEncoderConfiguration(_encoderConfig, _callback)
{
  if (_rtcEngine.client != null)
  {
    if (_LocalTracks.audioTrack != null)
    {
      _LocalTracks.audioTrack.stop();
      _LocalTracks.audioTrack.close();
      _LocalTracks.audioTrack = null;

      let audioConfig = {
        microphoneId: "",
        AEC: _encoderConfig.AEC,
        AGC: _encoderConfig.AGC,
        ANS: _encoderConfig.ANS,
        encoderConfig: _encoderConfig
      };
      [_LocalTracks.audioTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(audioConfig)
      ]);
      
      if (_LocalTracks.audioTrack)
      {
        _LocalTracks.audioTrack.setVolume(_rtcEngine.audioRecordignVolume);
        await _rtcEngine.client.publish(_LocalTracks.audioTrack);
        _LocalTracks.audioTrack.setEnabled(!_rtcEngine.muteAudio);
      }
    }
  }

  if (_callback)
  {
    _callback();
  }
  _AudioEncoderConfig = _encoderConfig;
  _Log(_AudioEncoderConfig);
}

/**
 * @brief   Subscribe a callback to an agora event. See the agora Doc to see the available events.
 *          This is only for client events 
 *          https://docs.agora.io/en/Video/API%20Reference/web_ng/interfaces/iagorartcclient.html
 * @param   #String: Envent to subscribe.
 * @param   #function: the callback().
 * @bug     No know Bugs.
 */
function SubscribeEventListener(_event, _callback)
{
  if (_rtcEngine.client == null)
  {
    return;
  }
  _rtcEngine.client.on(_event, _callback);
}

/**
 * @brief   Return the stats for the remote user
 * @param   #Number: The remote user ID.
 * @bug     No know Bugs.
 */
function GetRemoteVideoStats(_userID)
{
  if (_rtcEngine.client == null)
  {
    return null;
  }
  return _rtcEngine.client.getRemoteVideoStats()[_userID];
}