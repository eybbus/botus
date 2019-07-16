//const Discord = require('discord.js');
const config = require('./conf/config');
const bot = new Discord.Client();

bot.on('ready', () => {
  console.log('Logged in as %s - %s\n', bot.user.username, bot.user.id);
});

bot.on('message', message => {});

bot.login(config.discordToken);
