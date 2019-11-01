const { youtubeKey, volumeAmount, soundCloudKey } = require('../../config');
const YoutubeAPI = require('simple-youtube-api');
const util = require('util');
const request = require('request');
const requestPromise = util.promisify(request);
const url = require('url');
const youtube = new YoutubeAPI(youtubeKey);

('use strict');
module.exports = class Song {
  constructor(url, voiceChannel) {
    this._url = url;
    this._title = '';
    this._streamType = '';
    this._voiceChannel = voiceChannel;
    this._isPlaying = false;
    this._thumbnail = ''; //TODO: set default image;
    this._description = '';
    this._requestedBy = '';
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
  set requestedBy(string) {
    this._requestedBy = string;
  }

  /**
   * Initilizes the song with title and streamType.
   * @param {boolean} isAttachment
   */
  async init(isAttachment = false) {
    if (isAttachment) {
      // If the song is an attachment get title from end of file.
      this._title = 'Attachment: ' + this._url.split('/').pop();
    } else if (isValidYoutubeLink(this._url)) {
      const id = getYoutubeId(this._url);
      const video = await youtube.getVideoByID(id);

      if (video.raw.snippet.liveBroadcastContent === 'live') {
        throw new Error('Youtube livestreams are not supported');
      } else {
        this._title = video.title;
        this._streamType = 'youtube';
      }
    } else if (isValidSoundcloudLink(this._url)) {
      console.log('soundcloud init');
      const response = await requestPromise(
        `https://api.soundcloud.com/resolve.json?url=${this._url}&client_id=${soundCloudKey}`,
        { json: true }
      );
      console.log(response.body);
      if (response.body.tracks != undefined) {
        throw new Error('Soundcloud playlists are not supported');
      }
      const { artwork_url, stream_url, title, description } = response.body;
      this._description = description;
      this._thumbnail = artwork_url;
      this._url = stream_url;
      this._title = title;
      this._streamType = 'soundcloud';
    } else {
      this._title = `${url.parse(this._url).hostname} audio`;
      this._streamType = 'unknown';
    }
  }
};

/**
 * Checks if url string is a valid Youtube link.
 * @param {string} url
 */
function isValidYoutubeLink(url) {
  return url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/);
}

/**
 * Checks if url string is a valid soundclound link.
 * @param {string} url
 */
function isValidSoundcloudLink(url) {
  return url.match(/^https?:\/\/soundcloud\.com\/(.*)\/(.*)$/);
}

/**
 * Returns youtube video id from a youtube url;
 * @param {string} url
 */
function getYoutubeId(url) {
  let temp = url.replace(/(>|<)/gi, '');
  temp = temp.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return temp[2].split(/[^0-9a-z_\-]/i)[0];
}
