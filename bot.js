const path = require('path');
const { CommandoClient } = require('discord.js-commando');
const { discordToken, owner, prefix } = require('./config');

const client = new CommandoClient({
  commandPrefix: prefix,
  unknownCommandResponse: false,
  owner: owner,
  disableEveryone: true
});

client.on('ready', () => {
  console.log('Logged in as %s - %s\n', client.user.username, client.user.id);
  client.user.setActivity('I am shame');
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['group1', 'Our First Command Group'],
    ['group2', 'Our Second Command Group']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.on('messageDelete', message => {
  console.log(message);
  message.channel.send('somebody was naughty');
});

client.login(discordToken);
