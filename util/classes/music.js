const { youtubeKey, volumeAmount, soundCloudKey } = require("../../config");
const YoutubeAPI = require("simple-youtube-api");
const util = require("util");
const request = require("request");

const requestPromise = util.promisify(request);
const youtube = new YoutubeAPI(youtubeKey);
const Song = require("./song");

("use strict");
module.exports = class Music {
  constructor() {
    this._queues = new Map();
  }

  getQueue(serverId) {
    if (!this._queues.has(serverId)) {
      this._queues.set(serverId, {
        songs: [],
        currentSong: {},
        volume: volumeAmount
      });
    }
    return this._queues.get(serverId);
  }

  hasCurrentSong(serverId) {
    let queue = this.getQueue(serverId);
    return Object.keys(queue.currentSong).length > 1;
  }

  async addSong(serverId, url, voiceChannel, requestedName, isAttachment) {
    const queue = this.getQueue(serverId);
    let youtubeParsed = YoutubeAPI.util.parseURL(url);
    if (isAttachment) {
      // If the song is an attachment get title from end of file.
      let title = "Attachment: " + url.split("/").pop();
      let song = new Song(
        url,
        title,
        "attachment",
        voiceChannel,
        "",
        requestedName
      );
      queue.songs.push(song);
    } else if (Object.keys(youtubeParsed).length !== 0) {
      if (youtubeParsed.channel !== undefined) {
        throw new Error("channel links are not supported");
      }
      if (youtubeParsed.playlist !== undefined) {
        let playlist = await youtube.getPlaylistByID(youtubeParsed.playlist);
        await playlist.getVideos(20); // TODO: decide how to deal with limit
        playlist.videos.forEach(video => {
          let song = new Song(
            video.url,
            video.title,
            "youtube",
            voiceChannel,
            video.description,
            requestedName
          );
          queue.songs.push(song);
        });
      } else {
        let video = await youtube.getVideoByID(youtubeParsed.video);
        if (video.raw.snippet.liveBroadcastContent === "live") {
          throw new Error("Youtube livestreams are not supported");
        } else {
          let song = new Song(
            url,
            video.title,
            "youtube",
            voiceChannel,
            video.description,
            requestedName
          );
          queue.songs.push(song);
        }
      }
    } else if (isValidSoundcloudLink(url)) {
      const response = await requestPromise(
        `https://api.soundcloud.com/resolve.json?url=${url}&client_id=${soundCloudKey}`,
        { json: true }
      );
      if (response.body.tracks != undefined) {
        response.body.tracks.forEach(track => {
          let song = new Song(
            track.stream_url,
            track.title,
            "soundcloud",
            voiceChannel,
            track.description,
            requestedName
          );
          queue.songs.push(song);
        });
      } else {
        const { artwork_url, stream_url, title, description } = response.body;
        let song = new Song(
          stream_url,
          title,
          "soundcloud",
          voiceChannel,
          description,
          requestedName
        );
        queue.songs.push(song);
      }

      // this._thumbnail = artwork_url;
    } else {
      let song = new Song(
        url,
        `${url.parse(url).hostname} audio`,
        "unknown",
        voiceChannel,
        "",
        requestedName
      );
      queue.songs.push(song);
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
  let temp = url.replace(/(>|<)/gi, "");
  temp = temp.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return temp[2].split(/[^0-9a-z_\-]/i)[0];
}
