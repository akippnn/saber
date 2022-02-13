const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { execPath } = require('process');
const { URL } = require('url')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('messagelink')
		.setDescription('Sends an embed of the message link to a target channel')
		.addStringOption(option =>
			option.setName('link')
				.setDescription('Right-click a message, copy the message link and paste it here.')
				.setRequired(true))
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Where to send the embedded link')
				.setRequired(true)),

	async execute(client, interaction) {

		perms = "SEND_MESSAGES"
		if (!interaction.member.permissionsIn(interaction.options.getChannel('channel')).has(perms)) {
			interaction.reply({ ephemeral: true, embeds: [{
				color: "#f04747",
				description: `You do not have the following permissions in that channel: ${perms}` }]});
			return ;
		}

		const start = async (message, author) => {
			console.log(message);
			console.log(author);
			try {
				let content = String(message.content);
				let lenFormatted = content.match(/<([^>]*)>/);
				if (lenFormatted) {
					lenFormatted = lenFormatted.reduce((previousValue, currentValue) => previousValue + (currentValue.length + 2), 0); 
				} else { 
					lenFormatted = 0
				};
				if ((content.length - lenFormatted) < 53) {
					content = content.substring(0, 50 + lenFormatted)+'...'
				};

				const embed = new MessageEmbed()
					.setDescription(content)
					.setColor(author.hexAccentColor)
					.setAuthor({ name: author.username, iconURL: author.avatarURL() });
					
				if (interaction.user != author) {
					embed.setFooter({ text: `${interaction.user.username} announced this embed`, iconURL: interaction.user.avatarURL() })
				};

				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setURL(new String(message.url).toString())
							.setLabel('Open')
							.setStyle('LINK'));

				await interaction.options.getChannel('channel').send({ embeds: [embed], components: [row] });
				await interaction.reply({ embeds: [{ description: 'Embed sent!' }], ephemeral: true });
			} catch(error) {
				console.error(error);
				const embed = new MessageEmbed()
					.setColor('#f04747')
					.setDescription('There was an error while executing this command!');
				await interaction.reply({ embeds: [embed], ephemeral: true });
			}
		};

		const messageLink = new URL(interaction.options.getString('link')).pathname.split("/");
		const channelId = messageLink[3];
		const messageId = messageLink[4];
		
		await client.channels.fetch(channelId).then((channel) => {
			channel.messages.fetch(messageId).then((message) => {
				message.author.fetch([true]).then((author) => {
					start(message, author);
				});
			})
		})
	},
};