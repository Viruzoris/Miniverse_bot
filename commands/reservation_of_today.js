const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reservation-du-jour')
		.setDescription('Affiche les resas du jour'),
    async execute() {}
};