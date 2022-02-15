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

// Default channel object for the console
var conChannel;

// Once ready
client.once('ready', () => {
	console.log('Ready!');
    conChannel = client.channels.cache.get(process.env.defaultChannelId);

    // Create an readline interface to allow input
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    // Ask for input
    function ask() {
        rl.question(`Send to ${conChannel.name} >> `, say => {
            try {
                switch (say.split(" ")[0]) {
                    // Deletes a message from passed message ID
                    case "/delete":
                        return new Promise(() => { 
                            conChannel.messages.fetch(say.split(" ")[1])
                                .then(message => {
                                    message.delete()
                                    console.log(`[DELETE] ${message.author.username}#${message.author.discriminator}: ${message}`)
                                })
                            ask() // Recursively ask
                        });

                    // Changes the channel object on conChannel
                    case "/channel":
                        return new Promise(() => {
                            conChannel = client.channels.cache.get(say.split(" ")[1])
                            ask() // Recursively ask
                        });

                    // Send a message on default
                    default:
                        conChannel.send(say)
                            .then(console.log(`[SENT ${conChannel}]`));
                            ask() // Recursively ask
                        break;
                };
            } catch (error) {
                console.error(error)
            };

        });
    }

    ask()
});

// Logs all message events the bot receives
client.on('messageCreate', message => {
    // A function to clear the current line and print the string passed to the function.
    function consoleMsg(string) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log(string);
    };
    
    if (message.channel == conChannel) {
        consoleMsg(`[${message.id}] ${message.author.username}#${message.author.discriminator}: ${message}`)
    } else {
        consoleMsg(
            '\x1b[2m%s\x1b[0m', // Dim color for channels that weren't selected
            `[${message.id} > ${message.channel.name} ${message.channel}] ${message.author.username}#${message.author.discriminator}: ${message}`
        )
    }
});

// Execute commands and throw errors
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

// Start the bot
client.login(process.env.DISCORD_TOKEN);