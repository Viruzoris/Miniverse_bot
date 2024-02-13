const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resa-jeu')
		.setDescription('Reserve une table à une date précise')
        .addStringOption( option =>
            option
            .setName('date')
            .setDescription('Choisisser la date à laquelle vous voulez jouer, format jj/mm/yyyy')
            .setRequired(true)   
        )
        .addStringOption( option => 
            option
            .setName('type')
            .setDescription('Choisisser le type de jeu auquel vous souhaitez jouer')
            .addChoices(
                { name: 'Warhammer 40K', value: 'Warhammer 40K' },
                { name: 'Warhammer Age of Sigmar', value: 'Warhammer Age of Sigmar' }
            )
            .setRequired(true)
        )
        .addUserOption( option =>
            option
            .setName('participants')
            .setDescription('Ajouter un/des participant(s)')    
        )
        .addStringOption( option => 
            option
            .setName('heure-debut')
            .setDescription('Heure de début de la partie, format hh:mm')
        )
        .addStringOption( option =>
            option
            .setName('heure-fin')
            .setDescription('Heure de fin de la partie, format hh:mm')
        ),
	async execute(interaction) {
		await interaction.reply('Hmmm, something went wrong');
	},
};