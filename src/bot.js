require('dotenv').config();
const fs = require('fs');
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');

const myIntents = new Intents();
Object.entries(Intents.FLAGS).map(intent => {
    myIntents.add(intent);
    console.log(`[INTENT] ${intent} : ${myIntents.has(intent)}`)
});

// New Client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Load Commands
client.commands = new Collection();
const commandFiles = fs.readdirSync(`${__dirname}/commands`).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`${__dirname}/commands/${file}`);
    // Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// Once ready
client.once('ready', () => {
	console.log('Ready!');
    let messageChannel = client.channels.cache.get('877488673250213930')

    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function ask() {
        rl.question(`${messageChannel.name}: `, say => {
            switch (say.split(" ")[0]) {
                case "/delete":
                    return new Promise(() => { 
                        messageChannel.messages.fetch(say.split(" ")[1])
                        .then(message => message.delete())
                    });
                case "/channel":
                    return new Promise(() => {
                        messageChannel = client.channels.cache.get(say.split(" ")[1])
                    });
                default:
                    messageChannel.send(say);
                    break;
            }
            ask()
        });
    }
    ask()
});

// On interactionCreate
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);   
    if (!command) return;

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error(error);
        const embed = new MessageEmbed()
            .setColor('#f04747')
            .setDescription('There was an error while executing this command!')
		await interaction.reply({ embeds: [embed], ephemeral: true });
	}
});

// Login
client.login(process.env.DISCORD_TOKEN);