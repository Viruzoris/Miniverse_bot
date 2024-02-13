// Require the necessary discord.js classes
const { Client, Events, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');

const { cron } = require('cron').CronJob;

// Require Sequelize
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});

const fs = require('node:fs');
const path = require('node:path');
const { type } = require('node:os');
const { job } = require('cron');

const Tags = sequelize.define('tags', {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	description: Sequelize.TEXT,
	username: Sequelize.STRING,
	usage_count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});

const game_resa = sequelize.define('game_resa', {
	id_reservation: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		unique: true,
		autoIncrement: true,
	},
	creator: Sequelize.TEXT,
	table: Sequelize.INTEGER,
	type: Sequelize.STRING,
	participants: Sequelize.TEXT,
	version: Sequelize.STRING,
	exception: Sequelize.BOOLEAN,
	date: Sequelize.TEXT,
	start_hour: Sequelize.TIME,
	end_hour: Sequelize.TEXT,
},
{
	initialAutoIncrement: 1
})

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
});

const triggerSeeReservationToday = async () => {
	let condition
	let embededResponse = [];
	//construct date :
	const currentDate = new Date();
	let currentDayOfMonth = currentDate.getDate();
	let currentMonth = currentDate.getMonth(); // Be careful! January is 0, not 1
	if (currentDayOfMonth < 9) currentDayOfMonth = "0" + currentDayOfMonth
	if(currentMonth<9) currentMonth = "0" + (currentMonth + 1)
	else currentMonth += 1
	const dateString = currentDayOfMonth + "/" + currentMonth;
	// "27-11"


	condition = { where: { date: dateString }}
	
	const resa = await game_resa.findAll(condition);
	if (resa) {
		embededResponse.push(new EmbedBuilder()
		.setTitle(`Voici les Réservation pour le ${dateString}`))
		resa.forEach( (res, index) => {
			embededResponse.push(generate_embed_response_looking_resa_game(index, res.id_reservation, res.type, res.start_hour, res.end_hour, res.participants, res.creator))
			console.log(res.creator)
			console.log('********')
		})
		return { embeds: embededResponse }
	}

	return embededResponse = generate_embed_response_looking_resa_game(false, dateString)
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	Tags.sync();
	game_resa.sync()
	console.log(`Ready! Logged in as ${c.user.tag}`);
	let scheduledMessage = job('10 00 00 * * 2-6', async () => {
	// This runs every day at 10:30:00, you can do anything you want
	// Specifing your guild (server) and your channel
		const guild = client.guilds.cache.get('1082201786661736469');
		const channel = guild.channels.cache.get('1082201787223789610');
		let condition
		let embededResponse = [];


		channel.send('You message');
	});
			
		// When you want to start it, use:
		scheduledMessage.start()
});

// Log in to Discord with your client's token
client.login(token);

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}


	//specialized behavior for specific function

	/**
	 * 
	 */
	if (interaction.commandName === 'resa-peinture') {
		const tagName = interaction.options.getString('name');
		const tagDescription = interaction.options.getString('description');

		try {
			// equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
			const tag = await Tags.create({
				name: tagName,
				description: tagDescription,
				username: interaction.user.username,
			});

			return interaction.reply(`Tag ${tag.name} added.`);
		}
		catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				return interaction.reply('That tag already exists.');
			}

			return interaction.reply('Something went wrong with adding a tag.');
		}
	}
	if (interaction.commandName === 'resa-jeu') {
		const tagName = interaction.options.getString('name');
		const tagDescription = interaction.options.getString('description');

		try {
			// equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
			const date = interaction.options.getString('date')
			const creator = interaction.user.id;
			const participants = interaction.options.getUser('participants')
			const participantsID = participants ? participants.id : null
			const type = interaction.options.getString('type')
			const heure_debut = interaction.options.getString('heure-debut')
			const heure_fin = interaction.options.getString('heure-fin')
			const resa = await game_resa.create({
				table: 1,
				type: type,
				creator: creator,
				participants: participantsID,
				version: 0,
				exception: false,
				date: date,
				start_hour: heure_debut,
				end_hour: heure_fin,
			});
			//console.log(resa)

			return interaction.reply({ embeds: [generate_embed_response_resa_game(resa.id_reservation, date, creator, participantsID, heure_debut, heure_fin, type)]});
		}
		catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				return interaction.reply('That tag already exists.');
			}
			console.log(error)
			return interaction.reply('Oops, an error occured');
		}
	}
	if (interaction.commandName === 'voir_reservation') {
		const date_resa = interaction.options.getString('name');

		await interaction.deferReply();

		let condition
		let embededResponse = [];
		if(date_resa){
			// retrieve data where date === name
			condition = { where: { date: date_resa }}
		} else {
			condition = {}
		}
		const resa = await game_resa.findAll(condition);
		if (resa) {
			embededResponse.push(new EmbedBuilder()
			.setTitle(`Voici les Réservation pour le ${date_resa}`))
			resa.forEach( (res, index) => {
				embededResponse.push(generate_embed_response_looking_resa_game(index, res.id_reservation, res.type, res.start_hour, res.end_hour, res.participants, res.creator))
				console.log(res.creator)
				console.log('********')
			})
			await interaction.editReply({ embeds: embededResponse })
			return;
		}

		embededResponse = generate_embed_response_looking_resa_game(false, date)
	
		return interaction.reply(`Could not find tag: ${tagName}`);
	}
	if(interaction.commandName === 'reservation-du-jour') {
		
		const guild = client.guilds.cache.get('1082201786661736469');
		const channel = guild.channels.cache.get('1082201787223789610');
		console.log('in')
		const embededResponse = await triggerSeeReservationToday()
		console.log(embededResponse)
		channel.send(embededResponse)
	}

	

	// generalized behavior for basic command
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
})

const generate_embed_response_resa_game = (id_resa, date, creator, participants, heure_debut, heure_fin, type) => {
	return embededResponse_reservation = new EmbedBuilder()
		.setTitle(`Réservation n°${id_resa} :loudspeaker:`)
		.setDescription(`<@${ creator }>` + (participants ? ' et <@${ participants }>' : '' + ', votre réservation est confirmée :muscle:'))
		.addFields(
			{ name: 'Date :calendar_spiral:', value: `${ date }`, inline: true },
			{ name: 'Créneau  :stopwatch:', value: `${ heure_debut } - ${ heure_fin }`, inline: true },
			{ name: 'Type de jeu :crossed_swords:', value: `${ type }`, inline: true },
		)
		.setFooter({ text: "Conserver votre numéro de réservation, il vous permet de modifier ou de supprimer votre réservation!" })
}

const generate_embed_response_looking_resa_game = (index, id_resa, type, heure_debut, heure_fin, participants, creator) => {
	
	return embededResponse = new EmbedBuilder()
	.setColor(0x00FFF)
	.setTitle(`Réservation n°${ id_resa }`)
	.addFields(
		{ name: 'Participants', value: '<@' + creator + '>' + (participants ? ` & <@${ participants }>` : '' ), inline: true },
		{ name: 'Créneau', value: ( heure_debut ? heure_debut : '?' ) + ' - ' +  ( heure_fin ? heure_fin : '?' ), inline: true },
		{ name: 'Type de jeu', value: `${ type }`, inline: true },
	)
}