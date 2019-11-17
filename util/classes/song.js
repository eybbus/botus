("use strict");
module.exports = class Song {
  constructor(url, title, streamType, voiceChannel, description, requestedBy) {
    this._url = url;
    this._title = title;
    this._streamType = streamType;
    this._voiceChannel = voiceChannel;
    this._isPlaying = false;
    this._thumbnail = ""; //TODO: set default image;
    this._description = description;
    this._requestedBy = requestedBy;
    //TODO: add duration;
  }

  set url(newUrl) {
    this._url = newUrl;
  }

  get url() {
    return this._url;
  }

  get voiceChannel() {
    return this._voiceChannel;
  }

  get streamType() {
    return this._streamType;
  }

  get title() {
    return this._title;
  }

  get thumbnail() {
    return this._thumbnail;
  }

  get description() {
    return this._description;
  }

  get requestedBy() {
    return this._requestedBy;
  }

  get duration() {
    return this._duration;
  }
};
