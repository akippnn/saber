const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
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

		const start = async (message) => {
			let content = new String()
			if (content.length < 53) {
				content = message.content.substring(0, 50)+'...'
			} else {
				content = message.content
			}

			const embed = new MessageEmbed()
				.setDescription()
				.setAuthor({ name: message.author.username, iconURL: message.author.avatarURL() });
				
			if (interaction.user != message.author) {
				embed.setFooter({ text: `${interaction.user.username} announced this embed`, iconURL: interaction.user.avatarURL() })
			};

			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setURL(new String(message.url).toString())
						.setLabel('Open')
						.setStyle('LINK'));

			const msgsend = async (user) => {
				console.log(user.hexAccentColor)
				embed.setColor(user.hexAccentColor)
				await interaction.options.getChannel('channel').send({ embeds: [embed], components: [row] });
				await interaction.reply({ embeds: [{ description: 'Embed sent!' }], ephemeral: true })
			}

			message.author.fetch({ force: true })
				.then((user) => msgsend(user))
		};

		await interaction.channel.messages
			.fetch(new URL(interaction.options.getString('link')).pathname.split("/")[4])
			.then((message) => {start(message)});
	},
};