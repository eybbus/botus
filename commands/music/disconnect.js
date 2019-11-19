const { Command } = require("discord.js-commando");
const music = require("./play");

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: "disconnect",
      aliases: ["dc", "abort", "abortus", "leave"],
      group: "music",
      memberName: "disconnect",
      description: "Disconnect from the voiceChannel"
    });
  }

  run(msg) {
    const { dispatcher } = music;
    if (!msg.guild.voiceConnection) {
      return msg.say("I'm not in a voice channel right now");
    } else if (msg.guild.voiceConnection) {
      if (typeof dispatcher == "undefined") {
        return msg.guild.voiceConnection.disconnect();
      }
      dispatcher.end();
      msg.guild.voiceConnection.disconnect();
      msg.reply("disconnected");
    }
  }
};
