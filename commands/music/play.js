const { Command } = require('discord.js-commando');
const { youtubeKey, volumeAmount, soundCloudKey } = require('../../config');
const YoutubeAPI = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const request = require('request');
const url = require('url');
const Song = require('../../util/classes/song');

const youtube = new YoutubeAPI(youtubeKey);

let queue = [];
let timeoutObj;

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      group: 'music',
      memberName: 'play',
      description:
        'Plays music in voice channel. youtube search, youtube links, Soundcloud links and attachments are supported',
      examples: [
        'play https://www.youtube.com/watch?v=v4Wy7gRGgeA',
        'play searchword',
        'play https://soundcloud.com/frontbutt88/jontron-firework-full-cover',
        "drag file to chat and write 'prefix play'"
      ],
      args: [
        {
          key: 'query',
          prompt: '',
          type: 'string',
          default: '',
          validate: query => query.length > 0 && query.length < 200
        }
      ]
    });
  }

  async run(msg, { query }) {
    let voiceChannel = msg.member.voiceChannel;
    let song = null;
    if (!voiceChannel) {
      return msg.say('Join a channel and try again');
    }
    if (typeof msg.attachments.first() != 'undefined') {
      console.log('type: attachment');
      try {
        // TODO: validate whether attachment is an audio file.
        song = new Song(msg.attachments.first().url, voiceChannel);
        await song.init(true);

        queue.push(song);
      } catch (err) {
        console.error(err);
        return msg.say('Something went wrong, contact the all mighty creator');
      }
    } else if (query.split(' ').length < 2 && stringIsValidUrl(query)) {
      try {
        song = new Song(query, voiceChannel);
        await song.init();
        queue.push(song);
      } catch (err) {
        console.error(err);
        return msg.say('The url might not be supported');
      }
    } else {
      try {
        if (query.length == 0) return;

        const video = await youtube.searchVideos(query, 1);

        if (video.length == 0) {
          return msg.say('No video found');
        }

        song = new Song(
          `https://www.youtube.com/watch?v=${video[0].raw.id.videoId}`,
          voiceChannel
        );

        await song.init();
        queue.push(song);
      } catch (err) {
        console.error(err);
        return msg.say(
          'Something went wrong with youtube search, contact the all mighty creator'
        );
      }
    }

    console.debug(queue.length);
    if (queue.length > 1) {
      return msg.say(`${song.title} added to queue`);
    } else {
      return playSong(queue, msg);
    }
  }
};

function playSong(queue, msg) {
  if (timeoutObj != null) {
    clearTimeout(timeoutObj);
    timeoutObj = null;
  }
  let song = queue[0];
  song.voiceChannel
    .join()
    .then(connection => {
      let dispatcher = getStream(song, connection);
      dispatcher
        .on('start', () => {
          module.exports.dispatcher = dispatcher;
          module.exports.queue = queue;
          return msg.say(`Now Playing: ${queue[0].title}`);
        })
        .on('end', () => {
          queue.shift();
          if (queue.length >= 1) {
            return playSong(queue, msg);
          } else {
            timeoutObj = setTimeout(() => {
              song.voiceChannel.leave();
            }, 300000);
          }
        })
        .on('error', err => {
          msg.say('Cannot play song');
          console.error(err.message);
          queue.shift();
          if (queue.length >= 1) {
            return playSong(queue, msg);
          } else {
            return msg.guild.voiceConnection.disconnect();
          }
        })
        .on('debug', console.log);
    })
    .catch(err => {
      console.log(err);
      return msg.guild.voiceConnection.disconnect();
    });
}

function getSoundCloudStream(url) {
  return request({
    url: url,
    followAllRedirects: true,
    qs: {
      client_id: soundCloudKey
    },
    encoding: null
  });
}

function stringIsValidUrl(string) {
  try {
    new url.URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

function getStream(song, connection) {
  let dispatcher = null;
  switch (song.streamType) {
    case 'attachment':
      dispatcher = connection.playArbitraryInput(song.url);
      break;
    case 'youtube':
      dispatcher = connection.playStream(
        ytdl(song.url, {
          volume: volumeAmount,
          quality: 'highestaudio',
          highWaterMark: 1024 * 1024 * 10
        })
      );
      break;
    case 'soundcloud':
      dispatcher = connection.playArbitraryInput(getSoundCloudStream(song.url));
      break;
    default:
      dispatcher = connection.playArbitraryInput(song.url);
      break;
  }
  return dispatcher;
}
