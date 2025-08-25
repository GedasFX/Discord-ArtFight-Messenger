# ArtFight Attacks Messenger for Discord

Posts ArtFight attacks on Discord to share with your friends.

## Usage

1. Install the Discord app from [here](https://discord.com/oauth2/authorize?client_id=1257050187621470289). App works both as a user installation and server.
2. Run the following command with the URL of the attack you wish to post:

<img width="533" height="108" alt="image" src="https://github.com/user-attachments/assets/2833a9dd-903f-4e92-bf45-adf796b6f561" />

3. Ponder at the result:

<img width="404" height="575" alt="image" src="https://github.com/user-attachments/assets/169ee024-be20-40c9-8e53-3fffa8f49cc7" />

### The following data is available on attacks:

- Title & Link to Attack;
- Polished Status (titled is surrounded with ✨);
- Attack Description (if exists);
- Attacker name (and URL);
- Defender name (and URL);
- Thumbnail;
- Image;
- Revenge Chain Status (if is a revenge);
  - Includes level, previous and next attack;
- Content Warnings (if any)
- Points & Friendly Fire Status
- Time of Submission

## Instalation (Self-Host)

The Discord app runs from a docker container:

```yaml
services:
  app:
    image: ghcr.io/gedasfx/discord-artfight-messenger:main
    environment:
      TOKEN: ${TOKEN}                  # Required. Discord bot token.
      CLIENT_ID: ${CLIENT_ID}          # Optional. Required only for using the command `node register-commands.js`
      BROWSER_INACTIVITY_TIMEOUT: 120  # Optional. Defaults to 120 (2 minutes).
    volumes:
      - ./data:/app/data               # Required. Needed for browser data persistence.
    # user: root                       # Optional. Might be required on some operating systems
    hostname: artfight-messenger       # Optional. Highly recommended as not having hostname set could corrupt browser data.
    restart: unless-stopped
```

### Registering Commands

You can register the Discord App commands by running the following, after the bot started running.
```
sudo docker compose exec app ./register
```

### Persisting session

This is currently the most jank part of the application, but it works good enough. You will need a machine with a display for this to work.

1. Clone repository and set (`npm install` and `npm run setup`).
2. Update `.env` file to contain your bot token. Consider raising `BROWSER_INACTIVITY_TIMEOUT` to a longer duration while performing the initial setup.
3. Navigate to AF website and log in normally.
4. Stop the application.
5. Delete `SingletonCookie`, `SingletonLock`, and `SingletonSocket` files from `./data` directory if they exist.
6. Transfer the data directory to the server and run the docker container as normal.

These steps will persist the authentication data inside the data folder, and the app will work until the tokens expire. Currently they have expiry duration of 1 year.

## Disclaimer

**This project is for educational purposes only.**

This project really exists only because my friends do not want to sign up for AF, and current Discord embeds have basically no information. I wanted to engineer a better solution.
