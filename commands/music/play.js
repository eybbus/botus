const { Command } = require('discord.js-commando');
const { youtubeKey, volumeAmount, soundCloudKey } = require('../../config');
const YoutubeAPI = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const request = require('request');
const url = require('url');
const Song = require('../../util/classes/song');

const youtube = new YoutubeAPI(youtubeKey);

var queue = [];
var isPlaying;
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
    // TODO: refactor
    let voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel) {
      return msg.say('Join a channel and try again');
    }

    console.log(query);
    if (typeof msg.attachments.first() != 'undefined') {
      console.log('type: attachment');
      try {
        // TODO: validate whether attachment is an audio file.
        let song = new Song(msg.attachments.first().url, voiceChannel);
        await song.init(true);

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
    } else if (query.split(' ').length < 2 && stringIsValidUrl(query)) {
      //TODO: set song
      try {
        console.log('type: url');
        let song = new Song(query, voiceChannel);
        await song.init();
        queue.push(song);

        if (isPlaying == false || typeof isPlaying == 'undefined') {
          isPlaying = true;
          return playSong(queue, msg);
        } else if (isPlaying == true) {
          return msg.say(`${song.title} added to queue`);
        }
      } catch (err) {
        console.error(err);
        return msg.say('Url might not be supported ');
      }
    } else {
      console.log('type: search');
      try {
        if (query.length == 0) return;
        const video = await youtube.searchVideos(query, 1);

        if (video.length == 0) {
          return msg.say('No video found');
        }
        let song = new Song(
          `https://www.youtube.com/watch?v=${video[0].raw.id.videoId}`,
          voiceChannel
        );
        await song.init();

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
  if (timeoutObj != null) {
    clearTimeout(timeoutObj);
    timeoutObj = null;
  }
  console.log('streamType: ' + queue[0].streamType);
  let voiceChannel = queue[0].voiceChannel;
  queue[0].voiceChannel
    .join()
    .then(
      connection => {
        var dispatcher = null;
        // new
        switch (queue[0].streamType) {
          case 'attachment':
            dispatcher = connection.playArbitraryInput(queue[0].url);
            break;
          case 'youtube':
            dispatcher = connection.playArbitraryInput(
              ytdl(queue[0].url, {
                volume: volumeAmount,
                quality: 'highestaudio',
                highWaterMark: 1024 * 1024 * 10
              })
            );
            break;
          case 'soundcloud':
            dispatcher = connection.playArbitraryInput(
              getSoundCloudStream(queue[0].url)
            );
            break;
          default:
            console.log('got here');
            console.log(queue[0].url);
            dispatcher = connection.playArbitraryInput(queue[0].url);
            break;
        }
        dispatcher
          .on('start', () => {
            module.exports.dispatcher = dispatcher;
            module.exports.queue = queue;
            voiceChannel = queue[0].voiceChannel;
            return msg.say(`Now Playing: ${queue[0].title}`);
          })
          .on('end', () => {
            queue.shift();
            if (queue.length >= 1) {
              return playSong(queue, msg);
            } else {
              isPlaying = false;
              timeoutObj = setTimeout(() => {
                voiceChannel.leave();
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
              isPlaying = false;
              return msg.guild.voiceConnection.disconnect();
            }
          })
          .on('debug', console.log);
      },
      error => {
        console.error('something bad happened ');
      }
    )
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
