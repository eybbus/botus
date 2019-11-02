# Botus
Discord bot made with dirscord.js
**Author:** Eyþór Freyr Óskarsson.
**Status:** Currently converting a old dicord bot I made in 2017, over to [discord.js-commando](https://discord.js.org/#/docs/commando/master/general/welcome) and making it public and readable.

----------

## Tasks
- [ ] punishment command
  - command bot to punish user, Would play random audio that have been decided by other users.
  - Token system. Users have to use token to punish.
- [x] Add music functionality
  - [x] play
    - [x] Soundcloud links
    - [ ] Soundcloud playlist
    - [x] Youtube links
    - [ ] Youtube playlist
    - [x] Attachments
    - [x] try to play arbitary link 
      - [ ] parse html from link and find video source and play it
    - [ ] display length
  - [x] pause
  - [x] see queue
  - [x] skip
  - [ ] time
    - get current time and remaining time of song
  - [ ] seek
- [ ] configuration commands
- [ ] unit tests
  - No available package to mock client. Might just unit test utility functions;
- [x] deploy bot to the cloud
  - [ ] docker deployment
  - [ ] Add continues deployment

