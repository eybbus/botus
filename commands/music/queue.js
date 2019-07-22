const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const music = require('./play');

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      aliases: ['song-list', 'next-songs'],
      group: 'music',
      memberName: 'queue',
      description: 'Display the song queue'
    });
  }

  run(message) {
    const queue = music.queue;
    if (!queue) return message.say('There are no songs in queue!');
    const titleArray = [];
    queue.map(obj => {
      titleArray.push(obj.title);
    });

    var queueEmbed = new RichEmbed()
      .setColor('#ff7373')
      .setTitle('Music Queue');
    for (let i = 0; i < titleArray.length; i++) {
      queueEmbed.addField(`${i + 1}: ${titleArray[i]}`);
    }

    return message.say(queueEmbed);
  }
};
