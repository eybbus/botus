const { Command } = require('discord.js-commando');
const { youtubeKey, volumeAmount } = require('../../config');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const youtube = new Youtube(youtubeKey);

var queue = [];
var isPlaying;

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      group: 'music',
      memberName: 'play',
      description: 'Plays music in voice channel',
      examples: ['play https://www.youtube.com/watch?v=v4Wy7gRGgeA', 'play '],
      args: [
        {
          key: 'query',
          prompt: '',
          type: 'string',
          validate: query => query.length > 0 && query.length < 200
        }
      ]
    });
  }

  async run(msg, { query }) {
    let voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel) {
      return msg.say('Join a channel and try again');
    }

    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      const url = query;
      try {
        query = query
          .replace(/(>|<)/gi, '')
          .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        const id = query[2].split(/[^0-9a-z_\-]/i)[0];
        const video = await youtube.getVideoByID(id);

        if (video.raw.snippet.liveBroadcastContent === 'live') {
          return msg.say('Live Streams not implemented');
        }

        const title = video.title;
        const song = {
          url,
          title,
          voiceChannel
        };

        queue.push(song);

        if (isPlaying == false || typeof isPlaying == 'undefined') {
          isPlaying = true;
          return playSong(queue, msg);
        } else if (isPlaying == true) {
          return msg.say(`${song.title} added to queue`);
        }
      } catch (err) {
        console.error(err);
        return msg.say('Something went wrong, contact the all mighty creator');
      }
    }
  }
};

function playSong(queue, msg) {
  let voiceChannel;
  queue[0].voiceChannel
    .join()
    .then(connection => {
      const dispatcher = connection
        .playStream(
          ytdl(queue[0].url, {
            volume: volumeAmount,
            quality: 'highestaudio',
            highWaterMark: 1024 * 1024 * 10
          })
        )
        .on('start', () => {
          module.exports.dispatcher = dispatcher;
          module.exports.queue = queue;
          voiceChannel = queue[0].voiceChannel;
          msg.say(`Now Playing: ${queue[0].title}`);
          return queue.shift();
        })
        .on('finish', () => {
          if (queue.length >= 1) {
            return playSong(queue, msg);
          } else {
            isPlaying = false;
            return voiceChannel.leave();
          }
        })
        .on('error', e => {
          msg.say('Cannot play song');
          console.log(e);
          return voiceChannel.leave();
        });
    })
    .catch(err => {
      console.log(err);
      return voiceChannel.leave();
    });
}
