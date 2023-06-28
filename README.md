# @collabland/example-dev-action

This is for testing purpose.

This example illustrates how to implement a Collab action for Discord using
different interaction types:

- [Slash commands](https://discord.com/developers/docs/interactions/application-commands#slash-commands)
- [Interactions](https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object)
- [Responses](https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction)
- [Buttons](https://discord.com/developers/docs/interactions/message-components#buttons)
- [Select menus](https://discord.com/developers/docs/interactions/message-components#select-menus)
- [Modals (with text inputs)](https://discord.com/developers/docs/interactions/message-components#text-inputs)

# Try it out

```sh
npm run build
npm run server
ngrok http 3000
```

In your Discord server:

```
/test-flight install <https-url-from-ngrok>/dev-action
```

![Slash commands](docs/dev-action-commands.png)

![Screenshot](docs/dev-action.png)
