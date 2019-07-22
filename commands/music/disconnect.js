const { Command } = require('discord.js-commando');
const music = require('./play');

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'disconnect',
      aliases: ['dc', 'abort', 'abortus', 'leave'],
      group: 'music',
      memberName: 'disconnect',
      description: 'Disconnect from the voiceChannel'
    });
  }

  run(msg) {
    const { dispatcher, queue } = music;
    if (!msg.guild.voiceConnection) {
      return msg.say("I'm not in a voice channel right now");
    } else if (msg.guild.voiceConnection) {
      queue.length = 0;
      if (typeof dispathcer == 'undefined') {
        return msg.guild.voiceConnection.disconnect();
      }
      return dispatcher.end();
    }
  }
};
