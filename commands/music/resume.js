const { Command } = require("discord.js-commando");
const playCommand = require("./play");
const { music } = require("../../bot");
module.exports = class ResumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: "resume",
      group: "music",
      memberName: "resume",
      description: "Resumes the current playing song",
      examples: ["resume"]
    });
  }

  run(msg) {
    const dispatcher = playCommand.dispatcher;
    if (typeof dispatcher == "undefined") {
      return msg.say("No current song");
    } else if (!dispatcher.paused) {
      return msg.say("No song paused");
    }

    const queue = music.getQueue(msg.guild.id);

    if (msg.member.voiceChannel) {
      if (Object.keys(queue.currentSong).length === 0) {
        return msg.say("No current song");
      }
      if (msg.guild.voiceConnection) {
        dispatcher.resume();
        msg.say("resumed");
      } else {
        //TODO: call the playSong funtion instead of dispatcher.resume();
        queue.currentSong.voiceChannel.join().then(connection => {
          dispatcher.resume();
          msg.say("connected and resumed");
        });
      }
    }
  }
};
