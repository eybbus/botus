const { Command } = require('discord.js-commando');
const music = require('./play');

module.exports = class SkipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      group: 'music',
      memberName: 'skip',
      description: 'Skips the current playing song',
      examples: ['skip']
    });
  }

  run(msg) {
    if (!msg.member.voiceChannel) {
      return msg.reply('Must be in a channel to skip');
    }

    const dispathcer = music.dispatcher;

    if (typeof dispathcer == 'undefined') {
      return msg.say('No song is playing');
    }

    dispathcer.end();
  }
};
