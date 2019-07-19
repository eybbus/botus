const { Command } = require('discord.js-commando');
const { owner } = require('../../config');

module.exports = class ReplyComand extends Command {
  constructor(client) {
    super(client, {
      name: 'reply',
      group: 'group1',
      memberName: 'reply',
      description: 'Replies with a Message.',
      examples: ['reply']
    });
  }

  run(msg) {
    if (msg.author.id == owner) {
      return msg.say("My rightous father, I'm awake!");
    } else {
      return msg.say("hi bro, I'm awake, bro!");
    }
  }
};
