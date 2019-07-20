const dotenv = require('dotenv');

module.exports = {
  prefix: 'botus ',
  discordToken: process.env.DISCORD_TOKEN,
  youtubeKey: process.env.YOUTUBE_KEY,
  discord: process.env.DISCORD_KEY,
  owner: process.env.OWNER_ID,
  volumeAmount: 0.25
};
