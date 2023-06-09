const fs = require('node:fs')
const path = require('node:path')

const { Client, Collection, GatewayIntentBits } = require('discord.js')
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.commands = new Collection()
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath);

(function clientImport () {
  try {
    // Config
    client.config = require('./config.js')
    client.log = require('./base/log.js').log
    client.ci = require('./base/runCi.js').ci
    client.dbAuth = require('./base/dbAuth.js').dbAuth
    client.config.address = '127.0.0.1'
  } catch (e) {
    throw new Error('Failed to import client function!')
  }
})()

client.log('Starting...', 'info')

if (process.env.CI === 'true') {
  client.log('CI mode is enabled, running statup test only', 'ci')
}

// Load commands
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'))
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command)
    } else {
      client.log(
        `The command at ${filePath} is missing a required "data" or "execute" property.`,
        'warn'
      )
    }
  }
}

// Handle events
const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  const event = require(filePath)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(client.config.token)
