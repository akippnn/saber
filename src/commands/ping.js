const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong!'),
	async execute(client, interaction) {
		const embed = new MessageEmbed()
			.setColor('#ffd700')
			.addField('Websocket Latency', `${client.ws.ping} ms`, false)
		await interaction.reply({ content: "Pong!", embeds: [embed] });
	},
};