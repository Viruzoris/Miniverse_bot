const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('recherche')
		.setDescription('Poster un message pour rechercher un joueur')
        .addStringOption(option => 
            option
            .setName('type')
            .setDescription('Type de game voulu: AOS, Warhammer40k ...')
            .addChoices(
                { name: 'AOS', value: 'Age of Sigmar' },
                { name: 'WH40K', value: 'Warhammer 40K'}
            )
            .setRequired(true)
        )
        .addStringOption( option =>
            option
            .setName('format')
            .setDescription('Format du jeu: 2000, 1500, 1000, 500, à définir')
            .addChoices(
                { name: '2000', value: '2000' },
                { name: '1500', value: '1500' },
                { name: '1000', value: '1000' },
                { name: '500', value: '500' },
                { name: 'à définir', value: 'à définir' }
            )
            .setRequired(true)
        )
        .addStringOption( option => 
            option.setName('note')
            .setDescription('Ajouter une note pour les autres joueurs ou définisser un type de partie exceptionnelle')
            .setRequired(false)
        )
        .addStringOption( option =>
            option
            .setName('date')
            .setDescription('La date à laquelle vous souhaitez proposer une partie, au format jj/mm/aaaa')
        ),
	async execute(interaction) {
        const type = interaction.options.getString('type')
        const format = interaction.options.getString('format')
        const version = ('Not implemented yet :x:')
        const associatedRole = getAssociatedRole(type)
        const note = interaction.options.getString('note') ?? 'Pas de note'

        console.log(interaction.user.id)
        const embededResponse = new EmbedBuilder()
            .setTitle('Recherche de joueur :loudspeaker:')
            .setDescription(`<@&${ associatedRole }> \n<@${ interaction.user.id }> recherche un autre joueur pour une partie epic! Es-tu prêt à relever son défi?`)
            .addFields(
                { name: 'Type de jeu :crossed_swords:', value: `${ type }`, inline: true },
                { name: 'Nombre de point :triangular_flag_on_post:', value: `${ format }`, inline: true },
                { name: 'Note', value: note, inline: false },
            )
        await interaction.reply({ embeds: [embededResponse] })
    },
};

function getAssociatedRole(type) { 
    const associationTable = {
        'Age of Sigmar': '1083499774889689189',
        'Warhammer 40K': '1083503721792667668'
    }
    return associationTable[type]
}