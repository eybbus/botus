const { Command } = require("discord.js-commando");
const { RichEmbed } = require("discord.js");
const { music } = require("../../bot");

module.exports = class ClearCommand extends Command {
  constructor(client) {
    super(client, {
      name: "clear",
      aliases: ["cl", "remove"],
      group: "music",
      memberName: "clear",
      description: "Display the song queue",
      args: [
        {
          key: "type",
          prompt: "Type of removal: all, index, last, first",
          type: "string"
        },
        {
          key: "amount",
          prompt:
            "how many from last or first, if index choosen, its index of songs in the queue.",
          type: "integer",
          default: ""
          // TODO: Validate so number can't be less than 1
        }
      ]
    });
  }

  run(msg, { type, amount }) {
    const queue = music.getQueue(msg.guild.id);
    if (!queue.songs) return msg.say("There are no songs to remove!");
    let removedSongs = [];
    let text = ``;
    switch (type.toLowerCase()) {
      case "all":
        removedSongs = removeAll(queue);
        break;
      case "index":
        removedSongs = removeAt(amount, queue);
        break;
      case "last":
        removedSongs = removeLast(amount, queue);
        break;
      case "first":
        removedSongs = removeFirst(amount, queue);
        break;
      default:
        return msg.say("Nothing was removed");
        break;
    }
    let resp = [{ name: `Removed amount`, value: removedSongs.length }];

    msg.say({
      embed: {
        title: "Queue Clear",
        fields: resp
      }
    });
    return;
  }
};

function removeLast(amount, queue) {
  return queue.songs.splice(queue.songs.length - amount, queue.songs.length);
}

function removeFirst(amount, queue) {
  return queue.songs.splice(0, amount);
}

function removeAt(index, queue) {
  return queue.songs.splice(index - 1, 1);
}

function removeAll(queue) {
  return (queue.songs = []);
}
