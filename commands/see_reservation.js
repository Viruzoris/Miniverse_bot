const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('voir_reservation')
		.setDescription("Renvoies la liste des reservation d'une journée")
        .addStringOption(option =>
            option
            .setName('name')
            .setDescription('JJ/MM/YYYY')
        ),
	async execute(interaction) {
		await interaction.deferReply();
        for(i=0; i<99999; i++);
        await interaction.editReply('Fonction non implémentée')
	},
};