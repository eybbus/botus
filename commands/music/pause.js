const { Command } = require('discord.js-commando');
const music = require('./play');

module.exports = class PauseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pause',
      group: 'music',
      memberName: 'pause',
      description: 'Pauses the current song playing',
      examples: ['pause']
    });
  }

  run(msg) {
    if (!msg.member.voiceChannel) {
      return msg.reply('Must be in a channel to pause');
    }

    const dispathcer = music.dispatcher;

    if (typeof dispathcer == 'undefined') {
      return msg.say('No song is playing');
    }

    dispathcer.pause();
  }
};
