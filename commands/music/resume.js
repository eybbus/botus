const { Command } = require('discord.js-commando');
const music = require('./play');

module.exports = class ResumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      group: 'music',
      memberName: 'resume',
      description: 'Resumes the current playing song',
      examples: ['resume']
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

    dispathcer.resume();
  }
};
