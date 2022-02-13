require('dotenv').config();
const argv = require('minimist-lite')(process.argv.slice(2), {
	string: 'guildId',
	alias: { g: 'guildId' }
});
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

try {
	console.log('Started refreshing application (/) commands.');
	
	if ('guildId' in argv) {
		const guildId = argv.guildId
		console.log(typeof guildId)
		rest.put(Routes.applicationGuildCommands(process.env.clientId, guildId), { body: commands })
			.then(() => console.log(`Successfully registered application commands for ${guildId}.`));
	} else {
		rest.put(Routes.applicationCommands(clientId), { body: commands })
			.then(() => console.log(`Successfully registered application commands globally.`));}
} catch (error) {
	console.error(error)
} finally {
	console.log('Done!')
}