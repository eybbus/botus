const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const { music } = require("../../bot");

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: "queue",
      aliases: ["song-list", "next-songs"],
      group: "music",
      memberName: "queue",
      description: "Display the song queue"
    });
  }

  run(msg) {
    const queue = music.getQueue(msg.guild.id);
    if (!queue.songs.length) return msg.say("There are no songs in queue!");
    let nowPlaying = queue.currentSong;
    let que = ``;
    for (var i = 0; i < queue.songs.length; i++) {
      if (i > 9) {
        que += `\n out of ${queue.songs.length} songs`;
        break;
      }
      que += `\n${i + 1}. **${queue.songs[i].title}**\nRequested By: ${
        queue.songs[i].requestedBy
      }`;
    }
    let resp = [
      { name: `Now Playing`, value: `**${nowPlaying.title}**` },
      { name: `Requested By`, value: nowPlaying.requestedBy },
      { name: `Queue [${queue.songs.length} songs]`, value: que }
    ];

    msg.channel.send({
      embed: {
        title: "Music Queue",
        fields: resp
      }
    });

    return;
  }
};
