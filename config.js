const dotenv = require('dotenv');

module.exports = {
  prefix: 'botus',
  discordToken: process.env.DISCORD_TOKEN,
  youtube: process.env.YOUTUBE_KEY,
  discord: process.env.DISCORD_KEY,
  owner: process.env.OWNER_ID
};
