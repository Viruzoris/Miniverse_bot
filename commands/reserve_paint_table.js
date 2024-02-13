const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resa-peinture')
		.setDescription('Reserve une table de peinture à une date')
        .addStringOption(option => 
            option
            .setName('name')
            .setDescription('Nom')
        )
        .addStringOption(option => 
            option
            .setName('description')
            .setDescription('desc')
        ),
        async execute(interaction) {
            await interaction.reply('Fonction non développée');
        },
};