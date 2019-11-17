const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const { youtubeKey, volumeAmount, soundCloudKey } = require("../../config");
const YoutubeAPI = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const request = require("request");
const url = require("url");
const youtube = new YoutubeAPI(youtubeKey);
const { music } = require("../../bot");

let queue = [];
let timeoutObj;

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: "play",
      group: "music",
      memberName: "play",
      description:
        "Plays music in voice channel. youtube search, youtube links, Soundcloud links and attachments are supported",
      examples: [
        "play https://www.youtube.com/watch?v=v4Wy7gRGgeA",
        "play searchword",
        "play https://soundcloud.com/frontbutt88/jontron-firework-full-cover",
        "drag file to chat and write 'prefix play'"
      ],
      args: [
        {
          key: "query",
          prompt: "",
          type: "string",
          default: "",
          validate: query => query.length > 0 && query.length < 200
        }
      ]
    });
  }

  async run(msg, { query }) {
    let voiceChannel = msg.member.voiceChannel;
    let guildId = msg.guild.id;
    let url = "";
    let isAttachment = false;
    if (!voiceChannel) {
      return msg.say("Join a channel and try again");
    }
    if (typeof msg.attachments.first() != "undefined") {
      url = msg.attachments.first().url;
      isAttachment = true;
    } else if (query.split(" ").length < 2 && stringIsValidUrl(query)) {
      url = query;
    } else {
      if (query.length == 0) return;
      const video = await youtube.searchVideos(query, 1);
      if (video.length == 0) {
        return msg.say("No video found");
      } else {
        url = `https://www.youtube.com/watch?v=${video[0].raw.id.videoId}`;
      }
    }

    try {
      await music.addSong(
        guildId,
        url,
        voiceChannel,
        msg.member.displayName,
        isAttachment
      );
    } catch (err) {
      console.error(err);
      return msg.say(err.message);
    }

    if (queue.length > 1) {
      return msg.say(`${song.title} added to queue`);
    } else {
      return playSong(msg);
    }
  }
};

function playSong(msg) {
  queue = music.getQueue(msg.guild.id);
  if (timeoutObj != null) {
    clearTimeout(timeoutObj);
    timeoutObj = null;
  }

  let song = queue.songs.shift();
  queue.currentSong = song;
  song.voiceChannel
    .join()
    .then(connection => {
      try {
        let dispatcher = getStream(song, connection);
        dispatcher
          .on("start", () => {
            module.exports.dispatcher = dispatcher;
            module.exports.queue = queue;
            // TODO: Refactor
            const embed = {
              title: `**Title**: ${song.title}`,
              color: 16726952,
              description: song.description,
              footer: {
                icon_url: msg.member.user.avatarURL,
                text: `Requested by ${msg.member.displayName}`
              },
              thumbnail: {
                url: song.thumbnail
                  ? song.thumbnail
                  : "https://cdn.discordapp.com/embed/avatars/0.png"
              },
              author: {
                name: "Playing",
                icon_url:
                  "https://www.macworld.co.uk/cmsdata/features/3612963/how_to_get_music_on_iphone_1600home_thumb800.jpg"
              }
            };
            return msg.channel.send({ embed: embed });
          })
          .on("end", reason => {
            console.log(reason);
            console.log(dispatcher.destroyed);
            if (queue.songs.length >= 1) {
              return playSong(msg);
            } else {
              timeoutObj = setTimeout(() => {
                song.voiceChannel.leave();
              }, 300000);
            }
          })
          .on("error", err => {
            msg.say("Cannot play song");
            console.error(err.message);
            if (queue.songs.length >= 1) {
              return playSong(msg);
            } else {
              return msg.guild.voiceConnection.disconnect();
            }
          })
          .on("debug", console.log);
      } catch (error) {
        console.log(error);
        msg.say(error.message);
        if (queue.songs.length >= 1) {
          return playSong(msg);
        } else {
          return msg.guild.voiceConnection.disconnect();
        }
      }
    })
    .catch(err => {
      console.log(err);
      return msg.guild.voiceConnection.disconnect();
    });
}

function getSoundCloudStream(url) {
  try {
    return request({
      url: url,
      followAllRedirects: true,
      qs: {
        client_id: soundCloudKey
      },
      encoding: null
    });
  } catch (error) {
    console.log(error);
    throw new Error("There was a problem retriving soundcloud stream");
  }
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
  console.log(song);
  switch (song.streamType) {
    case "attachment":
      dispatcher = connection.playArbitraryInput(song.url);
      break;
    case "youtube":
      dispatcher = connection.playArbitraryInput(
        ytdl(song.url, {
          volume: volumeAmount,
          fitler: "audioOnly",
          quality: "highestaudio",
          highWaterMark: 1 << 25
        })
      );
      break;
    case "soundcloud":
      dispatcher = connection.playArbitraryInput(getSoundCloudStream(song.url));
      break;
    default:
      dispatcher = connection.playArbitraryInput(song.url);
      break;
  }
  return dispatcher;
}
