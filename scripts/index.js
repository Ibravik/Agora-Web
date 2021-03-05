var onCall = false;
var injectStreamUrl = false;
var localVideoMute = false;
var localAudioMute = false;
var videoSource = eVIDEO_FEED.kCAMERA;
var channelConfig = {
  channelName: "",
  encryptionKey: "",
  encryptionType: eENCRYPTION_TYPE.kAES_128_XTS,
  clientID: 0
};
var screenEncoder = {
  bitrateMax: 4500,
  bitrateMin: 4000,
  frameRate: 10,
  height: 1080,
  width: 1920,
  degradationPreference: eDEGRADATION_PREFERENCE.kQUALITY
};
var fileEncoder = {
  bitrateMax: 4500,
  bitrateMin: 4000,
  frameRate: 10,
  height: 1080,
  width: 1920,
  degradationPreference: eDEGRADATION_PREFERENCE.kQUALITY,
  source: "videos/vid1.mp4",
  mediaStream: null
};
var cameraEncoder = {
  bitrateMax: 800,
  bitrateMin: 500,
  frameRate: 15,
  height: 480,
  width: 640,
  degradationPreference: eDEGRADATION_PREFERENCE.kBALANCED
};
var lowVideoEncoder = {
  bitrate: 140,
  framerate: 7,
  height: 180,
  width: 320
};
var encoderConfig = cameraEncoder;
var localVideoPlayConfig = {
  fit: eLOCAL_VIDEO_FIT.kCOVER,
  mirror: false,
  localPlayObj: null
};
var audioEncoder = {
  bitrate: 128,
  sampleRate: 32000,
  //sampleSize: 128,
  stereo: false,
  AEC: false,//echo
  AGC: false,//gain
  ANS: false,//noise
};
var urlEncoder = {
  url: "",
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

function AddLocalUI() {
  $("<div/>", {
    id: "local_stream_video",
    class: "localVideo"
  }).appendTo("#localVideoFeed");
  EnableLocalVideo("local_stream_video", !localVideoMute);

  $("<div/>", {
    id: "local_stream_ID",
    text: "ID: " + _ChannelSettings.clientID
  }).appendTo("#localVideoFeed");
}

function RemoveLocalUI() {
  $("#local_stream_video").remove();
  $("#local_stream_ID").remove();
  $("#remoteVideoFeed").empty();
}

function UpdateVideoEncoderConfig(_config) {
  encoderConfig = _config;
  $("#HighEncoderWidth").prop("value", _config.width);
  $("#HighEncoderHeight").prop("value", _config.height);
  $("#HighVideoFPS").prop("value", _config.frameRate);
  $("#HighVideoBitrateMin").prop("value", _config.bitrateMin);
  $("#HighVideoBitrateMax").prop("value", _config.bitrateMax);
  $("#DegradationPreference").val(_config.degradationPreference);
  $("#DegradationPreference").selectmenu("refresh");
}

function ShowLowVideoEncoderSettings(_switchFlag) {
  if (_switchFlag) {
    $("#LowVidEncoderConfig").show("slow");
  }
  else {
    $("#LowVidEncoderConfig").hide("slow");
  }
}

function ShowSourceVideo(_switchFlag) {
  if (_switchFlag) {
    $("#VideoSourceSelection").show("slow");
    let videoPlayer = $("#VideoPlayer")[0];

    videoPlayer.pause();
    $("#VideoSource").attr("src", fileEncoder.source);
    videoPlayer.load();

    fileEncoder.mediaStream = videoPlayer.captureStream(fileEncoder.frameRate);
    SetFileVideoFeed(fileEncoder.mediaStream, function () {
      EnableLocalVideo("local_stream_video", !localVideoMute);
    });
  }
  else {
    $("#VideoSourceSelection").hide("slow");
    let videoPlayer = $("#VideoPlayer")[0];

    videoPlayer.pause();
    $("#VideoSource").attr("src", "");
    videoPlayer.load();
  }
}

function EnableURLSettings(_switchFlag) {
  $("#VideoURL").prop("disabled", !_switchFlag);
  $("#URLEncoderWidth").spinner("option", "disabled", !_switchFlag);
  $("#URLEncoderHeight").spinner("option", "disabled", !_switchFlag);
  $("#URLVideoFPS").spinner("option", "disabled", !_switchFlag);
  $("#URLVideoBitrate").spinner("option", "disabled", !_switchFlag);
  $("#URLAudioBitrate").spinner("option", "disabled", !_switchFlag);
  $("#URLAudioSampleRate").spinner("option", "disabled", !_switchFlag);
  $("#URLAudioStereo").checkboxradio("option", "_switchFlag", !_switchFlag);
  $("#URLAudioVolume").slider("option", "disabled", !_switchFlag);
  $("#URLAudioStereo").checkboxradio("option", "disabled", !_switchFlag);
}

function handleUserPublished(_user, _mediaType) {
  if (_mediaType == "audio") {
    return;
  }

  setTimeout(function () {
    EnableRemoteVideo("remote_stream_video_" + _user.uid, _user.uid, true);
  }, 2000);
}

function handleUserUnpublished(user) {
}

function onUserJoin(_user) {
  // all
  $("<fieldset/>", {
    id: "remote_stream_" + _user.uid,
    name: "remote_stream_" + _user.uid,
  }).appendTo("#remoteVideoFeed");

  // video
  $("<div/>", {
    id: "remote_stream_video_" + _user.uid,
    name: "remote_stream_video_" + _user.uid,
    class: "remoteVideo"
  }).appendTo("#remote_stream_" + _user.uid);

  // id
  $("<div/>", {
    id: "remote_stream_ID_" + _user.uid,
    name: "remote_stream_ID_" + _user.uid,
    text: "ID: " + _user.uid
  }).appendTo("#remote_stream_" + _user.uid);

  // quality button label
  $("<label/>", {
    name: "remote_stream_quality_" + _user.uid,
    for: "remote_stream_cb_quality_" + _user.uid,
    id: "remote_stream_quality_" + _user.uid
  }).appendTo("#remote_stream_" + _user.uid);

  // quality button
  $("<input/>", {
    name: "remote_stream_cb_quality_" + _user.uid,
    type: "checkbox",
    id: "remote_stream_cb_quality_" + _user.uid
  }).appendTo("#remote_stream_" + _user.uid);
  $("#remote_stream_cb_quality_" + _user.uid).checkboxradio();
  $("#remote_stream_quality_" + _user.uid).html("Change Quality to: High");
  $("#remote_stream_cb_quality_" + _user.uid).checkboxradio("option", "checked", false);

  // mute button label
  $("<label/>", {
    name: "remote_stream_muteAudio_" + _user.uid,
    for: "remote_stream_cb_muteAudio_" + _user.uid,
    id: "remote_stream_muteAudio_" + _user.uid
  }).appendTo("#remote_stream_" + _user.uid);

  // mute button
  $("<input/>", {
    name: "remote_stream_cb_muteAudio_" + _user.uid,
    type: "checkbox",
    id: "remote_stream_cb_muteAudio_" + _user.uid
  }).appendTo("#remote_stream_" + _user.uid);
  $("#remote_stream_cb_muteAudio_" + _user.uid).checkboxradio();
  $("#remote_stream_muteAudio_" + _user.uid).html("Mute Audio");
  $("#remote_stream_cb_muteAudio_" + _user.uid).checkboxradio("option", "checked", false);

  // mute button label
  $("<label/>", {
    name: "remote_stream_muteVideo_" + _user.uid,
    for: "remote_stream_cb_muteVideo_" + _user.uid,
    id: "remote_stream_muteVideo_" + _user.uid
  }).appendTo("#remote_stream_" + _user.uid);

  // mute button
  $("<input/>", {
    name: "remote_stream_cb_muteVideo_" + _user.uid,
    type: "checkbox",
    id: "remote_stream_cb_muteVideo_" + _user.uid
  }).appendTo("#remote_stream_" + _user.uid);
  $("#remote_stream_cb_muteVideo_" + _user.uid).checkboxradio();
  $("#remote_stream_muteVideo_" + _user.uid).html("Mute Video");
  $("#remote_stream_cb_muteVideo_" + _user.uid).checkboxradio("option", "checked", false);

  // fullscreen button label
  $("<label/>", {
    name: "remote_stream_FS_" + _user.uid,
    for: "remote_stream_cb_FS_" + _user.uid,
    id: "remote_stream_FS_" + _user.uid
  }).appendTo("#remote_stream_" + _user.uid);

  // fullscreen button
  $("<input/>", {
    name: "remote_stream_cb_FS_" + _user.uid,
    type: "checkbox",
    id: "remote_stream_cb_FS_" + _user.uid
  }).appendTo("#remote_stream_" + _user.uid);
  $("#remote_stream_cb_FS_" + _user.uid).checkboxradio();
  $("#remote_stream_FS_" + _user.uid).html("Fullscreen");
  $("#remote_stream_cb_FS_" + _user.uid).checkboxradio("option", "checked", false);

  // callbacks
  $("#remote_stream_cb_quality_" + _user.uid).on("click", function () {
    $("#remote_stream_cb_quality_" + _user.uid).checkboxradio("option", "disabled", true);
    let switchFlag = $("#remote_stream_cb_quality_" + _user.uid)[0].checked;
    if (switchFlag) {
      $("#remote_stream_quality_" + _user.uid).html("Change Quality to: Low");
      SetRemoteVideoQuality(_user.uid, eREMOTE_VIDEO_QUALITY.kHIGH, function () {
        $("#remote_stream_cb_quality_" + _user.uid).checkboxradio("option", "disabled", false);
        $("#remote_stream_cb_quality_" + _user.uid).checkboxradio("option", "checked", switchFlag);
      })
    }
    else {
      $("#remote_stream_quality_" + _user.uid).html("Change Quality to: High");
      SetRemoteVideoQuality(_user.uid, eREMOTE_VIDEO_QUALITY.kLOW, function () {
        $("#remote_stream_cb_quality_" + _user.uid).checkboxradio("option", "disabled", false);
        $("#remote_stream_cb_quality_" + _user.uid).checkboxradio("option", "checked", switchFlag);
      })
    }
  });
  $("#remote_stream_cb_muteAudio_" + _user.uid).on("click", function () {
    $("#remote_stream_cb_muteAudio_" + _user.uid).checkboxradio("option", "disabled", true);
    let switchFlag = $("#remote_stream_cb_muteAudio_" + _user.uid)[0].checked;
    MuteRemoteAudioStream(_user.uid, !switchFlag, function () {
      if (switchFlag) {
        $("#remote_stream_muteAudio_" + _user.uid).html("Unmute Audio");
      }
      else {
        $("#remote_stream_muteAudio_" + _user.uid).html("Mute Audio");
      }
      $("#remote_stream_cb_muteAudio_" + _user.uid).checkboxradio("option", "disabled", false);
      $("#remote_stream_cb_muteAudio_" + _user.uid).checkboxradio("option", "checked", switchFlag);
    });
  });
  $("#remote_stream_cb_muteVideo_" + _user.uid).on("click", function () {
    let switchFlag = $("#remote_stream_cb_muteVideo_" + _user.uid)[0].checked;
    EnableRemoteVideo("remote_stream_video_" + _user.uid, _user.uid, !switchFlag);
    if (switchFlag) {
      $("#remote_stream_muteVideo_" + _user.uid).html("Unmute Video");
    }
    else {
      $("#remote_stream_muteVideo_" + _user.uid).html("Mute Video");
    }
    $("#remote_stream_cb_muteVideo_" + _user.uid).checkboxradio("option", "checked", switchFlag);
  });
  $("#remote_stream_cb_FS_" + _user.uid).on("click", function () {
    let switchFlag = $("#remote_stream_cb_FS_" + _user.uid)[0].checked;
    if (switchFlag) {
      $("#remote_stream_FS_" + _user.uid).html("Fullscreen");
      $("#remote_stream_video_" + _user.uid).attr("class", "remoteVideoBig");
    }
    else {
      $("#remote_stream_FS_" + _user.uid).html("Normal");
      $("#remote_stream_video_" + _user.uid).attr("class", "remoteVideo");
    }
    $("#remote_stream_cb_FS_" + _user.uid).checkboxradio("option", "checked", switchFlag);
  });
}

function onUserLeave(_user) {
  $("#remote_stream_" + _user.uid).empty();
  $("#remote_stream_" + _user.uid).remove();
}

$(function () {
  'use strict'

  // <!-- Agora -->
  if (!GetCompatibilityStatus()) {
    return;
  }
  StartUp(eLOG_LVL.kDebug);
  // <!-- Agora -->

  // this is for play the remote video in a local html object
  SubscribeEventListener("user-joined", onUserJoin);
  SubscribeEventListener("user-left", onUserLeave);
  SubscribeEventListener("user-published", handleUserPublished);
  SubscribeEventListener("user-unpublished", handleUserUnpublished);

  // assign callbacks
  $("#Settings").tabs();

  $("#Devices").tabs();

  $("#VideoDevice").text("Device: ");

  $("#AudioRecordignDevice").text("Device: ");

  $("#ClientRole").selectmenu({
    select: function (_event, _ui) {
      $("#ClientRole").selectmenu("disable");
      SetClientRole(_ui.item.value, function () {
        if (_ui.item.value == eCLIENT_ROLE.kAUDIENCE) {
          $("#InjectStreamURL").button("option", "disabled", true);
          EnableURLSettings(false);
          injectStreamUrl = false;
        }
        else {
          $("#InjectStreamURL").button("option", "disabled", false);
          EnableURLSettings(true);
          injectStreamUrl = false;
        }
        $("#ClientRole").selectmenu("enable");
      });
    }
  });

  $("#ChannelID").autocomplete({
    source: [],
    change: function (_event, _ui) {
      channelConfig.channelName = $("#ChannelID")[0].value;
      $("#JoinChannel").button("option", "disabled", !channelConfig.channelName);
    }
  });

  $("#ChannelPassword").autocomplete({
    source: [],
    change: function (_event, _ui) {
      channelConfig.encryptionKey = $("#ChannelPassword")[0].value;
    }
  });

  $("#EncryptionType").selectmenu({
    select: function (_event, _ui) {
      channelConfig.encryptionType = _ui.item.value;
    }
  });

  $("#JoinChannel").button({
    disabled: true
  });
  $("#JoinChannel").on("click", function () {
    $("#JoinChannel").button("option", "disabled", true);

    if (onCall) {
      LeaveChannel(function () {
        $("#VideoDevice").text("Device: ");
        $("#AudioRecordignDevice").text("Device: ");
        $("#JoinChannel").text("Join Channel");
        $("#ChannelID").prop("disabled", false);
        $("#ChannelPassword").prop("disabled", false);
        $("#EncryptionType").selectmenu("option", "disabled", false);
        $("#JoinChannel").button("option", "disabled", false);
        $("#InjectStreamURL").button("option", "disabled", true);
        $("#InjectStreamURL").text("Inject Stream URL");
        EnableURLSettings(false);
        RemoveLocalUI();
        injectStreamUrl = false;
        onCall = false;
      });
    }
    else {
      JoinChannel(channelConfig, function () {
        $("#VideoDevice").text("Device: " + GetCurrentDevice(eDEVICE_TYPE.kVideoRecording));
        $("#AudioRecordignDevice").text("Device: " + GetCurrentDevice(eDEVICE_TYPE.kAudioRecording));
        $("#JoinChannel").text("Leave Channel");
        $("#ChannelID").prop("disabled", true);
        $("#ChannelPassword").prop("disabled", true);
        $("#EncryptionType").selectmenu("option", "disabled", true);
        $("#JoinChannel").button("option", "disabled", false);
        $("#InjectStreamURL").button("option", "disabled", false);
        EnableURLSettings(_ClientSettings.role == eCLIENT_ROLE.kBROADCASTER);
        AddLocalUI();
        onCall = true;
      });
    }
  });

  $("#MuteLocalVideo").checkboxradio();
  $("#MuteLocalVideo").on("click", function () {
    localVideoMute = $("#MuteLocalVideo")[0].checked;
    $("#MuteLocalVideo").checkboxradio("option", "disabled", true);
    MuteLocalVideoStream(localVideoMute, function () {
      $("#MuteLocalVideo").checkboxradio("option", "disabled", false);
      $("#MuteLocalVideo").checkboxradio("option", "checked", localVideoMute);
      EnableLocalVideo("local_stream_video", !localVideoMute);
    });
  });

  $("#HighVideoDimensions").controlgroup();

  $("#HighEncoderWidth").spinner({
    max: 1920,
    min: 0,
    change: function (_event, _ui) {
      encoderConfig.width = parseInt($("#HighEncoderWidth")[0].value);
      $("#HighEncoderWidth").prop("value", encoderConfig.width);
    }
  });
  $("#HighEncoderWidth").prop("value", encoderConfig.width);

  $("#HighEncoderHeight").spinner({
    max: 1080,
    min: 0,
    change: function (_event, _ui) {
      encoderConfig.height = parseInt($("#HighEncoderHeight")[0].value);
      $("#HighEncoderHeight").prop("value", encoderConfig.height);
    }
  });
  $("#HighEncoderHeight").prop("value", encoderConfig.height);

  $("#HighVideoFrameRate").controlgroup();

  $("#HighVideoFPS").spinner({
    max: 30,
    min: 5,
    change: function (_event, _ui) {
      encoderConfig.frameRate = parseInt($("#HighVideoFPS")[0].value);
      $("#HighVideoFPS").prop("value", encoderConfig.frameRate);
    }
  });
  $("#HighVideoFPS").prop("value", encoderConfig.frameRate);

  $("#HighVideoBitrate").controlgroup();

  $("#HighVideoBitrateMin").spinner({
    min: 0,
    change: function (_event, _ui) {
      encoderConfig.bitrateMin = parseInt($("#HighVideoBitrateMin")[0].value);
      $("#HighVideoBitrateMin").prop("value", encoderConfig.bitrateMin);
    }
  });
  $("#HighVideoBitrateMin").prop("value", encoderConfig.bitrateMin);

  $("#HighVideoBitrateMax").spinner({
    min: 0,
    change: function (_event, _ui) {
      encoderConfig.bitrateMax = parseInt($("#HighVideoBitrateMax")[0].value);
      $("#HighVideoBitrateMax").prop("value", encoderConfig.bitrateMax);
    }
  });
  $("#HighVideoBitrateMax").prop("value", encoderConfig.bitrateMax);

  $("#DegradationPreference").selectmenu({
    select: function (_event, _ui) {
      encoderConfig.degradationPreference = _ui.item.value;
    }
  });

  $("#VideoOptions").selectmenu({
    select: function (_event, _ui) {
      fileEncoder.source = _ui.item.value;
      ShowSourceVideo(true);
    }
  });

  $("#MirrorMode").checkboxradio();
  $("#MirrorMode").on("click", function () {
    localVideoPlayConfig.mirror = $("#MirrorMode")[0].checked;
  });

  $("#VideoFit").selectmenu({
    select: function (_event, _ui) {
      localVideoPlayConfig.fit = _ui.item.value;
    }
  });

  $("#LowVideoDimensions").controlgroup();

  $("#LowEncoderWidth").spinner({
    max: 1920,
    min: 0,
    change: function (_event, _ui) {
      lowVideoEncoder.width = parseInt($("#LowEncoderWidth")[0].value);
      $("#LowEncoderWidth").prop("value", lowVideoEncoder.width);
    }
  });
  $("#LowEncoderWidth").prop("value", lowVideoEncoder.width);

  $("#LowEncoderHeight").spinner({
    max: 1920,
    min: 0,
    change: function (_event, _ui) {
      lowVideoEncoder.height = parseInt($("#LowEncoderHeight")[0].value);
      $("#LowEncoderHeight").prop("value", lowVideoEncoder.height);
    }
  });
  $("#LowEncoderHeight").prop("value", lowVideoEncoder.height);

  $("#LowVideoFrameRate").controlgroup();

  $("#LowVideoFPS").spinner({
    max: 30,
    min: 5,
    change: function (_event, _ui) {
      lowVideoEncoder.framerate = parseInt($("#LowVideoFPS")[0].value);
      $("#LowVideoFPS").prop("value", lowVideoEncoder.framerate);
    }
  });
  $("#LowVideoFPS").prop("value", lowVideoEncoder.framerate);

  $("#LowVideoBitrate").spinner({
    min: 0,
    change: function (_event, _ui) {
      lowVideoEncoder.bitrate = parseInt($("#LowVideoBitrate")[0].value);
      $("#LowVideoBitrate").prop("value", lowVideoEncoder.bitrate);
    }
  });
  $("#LowVideoBitrate").prop("value", lowVideoEncoder.bitrate);

  $("#ApplyEncoding").button();
  $("#ApplyEncoding").on("click", function () {
    $("#ApplyEncoding").button("option", "disabled", true);
    SetLocalPlayConfiguration(localVideoPlayConfig);
    SetLowVideoEncoderConfiguration(lowVideoEncoder, function () {
      SetHighVideoEncoderConfiguration(cameraEncoder, function () {
        SetScreenEncoderConfiguration(screenEncoder, function () {
          fileEncoder.mediaStream = $("#VideoPlayer")[0].captureStream(fileEncoder.frameRate);
          SetFileEncoderConfiguration(fileEncoder, function () {
            $("#ApplyEncoding").button("option", "disabled", false);
          });
        });
      });
    });
  });

  $("#AudioRecordignVolume").slider({
    value: 500,
    max: 1000,
    min: 0,
    slide: function (_event, _ui) {
      SetAudioRecordingVolume(_ui.value);
    }
  });

  $("#AudioBitrate").spinner({
    max: 3200,
    min: 32,
    change: function (_event, _ui) {
      audioEncoder.bitrate = parseInt($("#AudioBitrate")[0].value);
      $("#AudioBitrate").prop("value", audioEncoder.bitrate);
    }
  });
  $("#AudioBitrate").prop("value", audioEncoder.bitrate);

  $("#AudioSampleRate").spinner({
    max: 48000,
    min: 8000,
    change: function (_event, _ui) {
      audioEncoder.sampleRate = parseInt($("#AudioSampleRate")[0].value);
      $("#AudioSampleRate").prop("value", audioEncoder.sampleRate);
    }
  });
  $("#AudioSampleRate").prop("value", audioEncoder.sampleRate);

  $("#AudioStereo").checkboxradio();
  $("#AudioStereo").on("click", function () {
    audioEncoder.stereo = $("#AudioStereo")[0].checked;
  });

  $("#AudioAEC").checkboxradio();
  $("#AudioAEC").on("click", function () {
    audioEncoder.AEC = $("#AudioAEC")[0].checked;
  });

  $("#AudioAGC").checkboxradio();
  $("#AudioAGC").on("click", function () {
    audioEncoder.AGC = $("#AudioAGC")[0].checked;
  });

  $("#AudioANS").checkboxradio();
  $("#AudioANS").on("click", function () {
    audioEncoder.ANS = $("#AudioANS")[0].checked;
  });

  $("#ApplyAudioEncoding").button();
  $("#ApplyAudioEncoding").on("click", function () {
    $("#ApplyAudioEncoding").button("option", "disabled", true);
    SetAudioEncoderConfiguration(audioEncoder, function () {
      $("#ApplyAudioEncoding").button("option", "disabled", false);
    });
  });

  $("#MuteLocalAudio").checkboxradio();
  $("#MuteLocalAudio").on("click", function () {
    localAudioMute = $("#MuteLocalAudio")[0].checked;
    $("#MuteLocalAudio").checkboxradio("option", "disabled", true);
    MuteLocalAudioStream(localAudioMute, function () {
      $("#MuteLocalAudio").checkboxradio("option", "disabled", false);
      $("#MuteLocalAudio").checkboxradio("option", "checked", localAudioMute);
    });
  });

  $("#VideoFeedSource").selectmenu({
    select: function (_event, _ui) {
      videoSource = _ui.item.value;
      switch (_ui.item.value) {
        case eVIDEO_FEED.kCAMERA:
          UpdateVideoEncoderConfig(cameraEncoder);
          ShowLowVideoEncoderSettings(true);
          ShowSourceVideo(false);
          SetCameraVideoFeed(function () {
            EnableLocalVideo("local_stream_video", !localVideoMute);
          });
          break;
        case eVIDEO_FEED.kSCREEN:
          UpdateVideoEncoderConfig(screenEncoder);
          ShowLowVideoEncoderSettings(false);
          ShowSourceVideo(false);
          SetScreenVideoFeed(function () {
            EnableLocalVideo("local_stream_video", !localVideoMute);
          });
          break;
        case eVIDEO_FEED.kFILE:
          UpdateVideoEncoderConfig(fileEncoder);
          ShowLowVideoEncoderSettings(false);
          ShowSourceVideo(true);
          break;
      };
    }
  });

  $("#VideoURL").autocomplete({
    source: [],
    change: function (_event, _ui) {
      urlEncoder.url = $("#VideoURL")[0].value;
      $("#InjectStreamURL").button("option", "disabled", !urlEncoder.url);
    }
  });
  $("#VideoURL").prop("disabled", true);

  $("#URLVideoDimensions").controlgroup();

  $("#URLEncoderWidth").spinner({
    max: 1920,
    min: 0,
    change: function (_event, _ui) {
      urlEncoder.width = parseInt($("#URLEncoderWidth")[0].value);
      $("#URLEncoderWidth").prop("value", urlEncoder.width);
    }
  });
  $("#URLEncoderWidth").prop("value", urlEncoder.width);

  $("#URLEncoderHeight").spinner({
    max: 1080,
    min: 0,
    change: function (_event, _ui) {
      urlEncoder.height = parseInt($("#URLEncoderHeight")[0].value);
      $("#URLEncoderHeight").prop("value", urlEncoder.height);
    }
  });
  $("#URLEncoderHeight").prop("value", urlEncoder.height);

  $("#URLVideoFrameRate").controlgroup();

  $("#URLVideoFPS").spinner({
    max: 30,
    min: 5,
    change: function (_event, _ui) {
      urlEncoder.videoFramerate = parseInt($("#URLVideoFPS")[0].value);
      $("#URLVideoFPS").prop("value", urlEncoder.videoFramerate);
    }
  });
  $("#URLVideoFPS").prop("value", urlEncoder.videoFramerate);

  $("#URLVideoBitrateRange").controlgroup();

  $("#URLVideoBitrate").spinner({
    min: 0,
    change: function (_event, _ui) {
      urlEncoder.videoBitrate = parseInt($("#URLVideoBitrate")[0].value);
      $("#URLVideoBitrate").prop("value", urlEncoder.videoBitrate);
    }
  });
  $("#URLVideoBitrate").prop("value", urlEncoder.videoBitrate);

  $("#URLAudioBitrateRange").controlgroup();

  $("#URLAudioBitrate").spinner({
    max: 3200,
    min: 32,
    change: function (_event, _ui) {
      urlEncoder.audioBitrate = parseInt($("#URLAudioBitrate")[0].value);
      $("#URLAudioBitrate").prop("value", urlEncoder.audioBitrate);
    }
  });
  $("#URLAudioBitrate").prop("value", urlEncoder.audioBitrate);

  $("#URLAudioSampleRateRange").controlgroup();

  $("#URLAudioSampleRate").spinner({
    max: 48000,
    min: 8000,
    change: function (_event, _ui) {
      urlEncoder.audioSampleRate = parseInt($("#URLAudioSampleRate")[0].value);
      $("#URLAudioSampleRate").prop("value", urlEncoder.audioSampleRate);
    }
  });
  $("#URLAudioSampleRate").prop("value", urlEncoder.audioSampleRate);

  $("#URLAudioStereo").checkboxradio();
  $("#URLAudioStereo").on("click", function () {
    urlEncoder.audioChannels = $("#URLAudioStereo")[0].checked + 1;
  });

  $("#URLAudioVolume").slider({
    value: 500,
    max: 1000,
    min: 0,
    slide: function (_event, _ui) {
      urlEncoder.audioVolume = _ui.value;
    }
  });

  $("#InjectStreamURL").button({
    disabled: true
  });
  $("#InjectStreamURL").on("click", function () {
    $("#InjectStreamURL").button("option", "disabled", true);

    if (injectStreamUrl) {
      RemoveStreamUrl(function () {
        $("#InjectStreamURL").button("option", "disabled", false);
      });
      injectStreamUrl = false;
    }
    else {
      PublishStreamUrl(urlEncoder.url, urlEncoder, function () {
        $("#InjectStreamURL").button("option", "disabled", false);
      });
      injectStreamUrl = true;
    }
    EnableURLSettings(!injectStreamUrl);
  });

  EnableURLSettings(false);
  ShowSourceVideo(false);
  UpdateVideoEncoderConfig(cameraEncoder);
});