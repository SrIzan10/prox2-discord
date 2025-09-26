# prox2-discord

<img width="864" height="218" alt="Screenshot_20250921_140200" src="https://github.com/user-attachments/assets/22ea3b26-c2ae-4976-b6ee-890a46fb314c" />

[try it out!](https://discord.com/oauth2/authorize?client_id=1418290558052601968&permissions=120259086336&integration_type=0&scope=bot)

prox2-discord is a discord bot built with [bun](https://bun.sh/), [prisma](https://www.prisma.io/), and [sern](https://sern.dev/).  
its main purpose is to anonymize users in a discord server who want to say... rather controversial things.

it is heavily inspired by hack club's prox2.

## Features
- multi-server support
- setup ease of use
- modern tech stack
- upvote/downvote system
- encrypted everything
- uhh it works i guess

## Commands
- `/setup` - sets up the bot in your server (admin only)
- `/prox2` - post an anonymous message
- `/reply` - replies to your own post
- `/unsetup` - removes previous configuration (admin only)

## Development

- clone this
- `bun i`
- copy `.env.example` to `.env` and fill in the values
- `bun prisma migrate dev`
- `bun run dev`
- invite the bot to a test server i guess
