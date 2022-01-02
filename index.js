const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
	console.log('ready!');
});

const prefix = '!'; // you can customize the prefix here

const leveling = require('discord-leveling'); // required for leveling

let db = require('quick.db'); // for database (economy, etc)

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content
		.slice(prefix.length)
		.trim()
		.split(' ');
	const command = args.shift().toLowerCase();

	let profile = await leveling.Fetch(message.author.id);
	leveling.AddXp(message.author.id, 15); // adds an exp to the user when user sends message

	if (profile.xp + 15 > 150) {
		leveling.AddLevel(message.author.id, 1);
		leveling.SetXp(message.author.id, 0);
		message.channel.send(
			`Congratulations ${
				message.author.username
			}, you just advanced to level ${profile.level +
				1}! Unlock eash level at 150 exp!`
		);
	} // Message to send when a member is levelled up

	if (command === 'help') {
		let helpembed = new Discord.MessageEmbed()
			.setColor('RANDOM')
			.setTitle('Here are the help commands! Feel free to try them out!')
			.setDescription('The bot prefix is `!`')
			.addField('Moderation', 'Moderation commands to punish members!')
			.addField('!kick <@user> [reason]', 'kicks a user!')
			.addField('!ban <@user> [reason]', 'bans a user!')
			.addField('!warn <@user> [reason]', 'warns a user!')
			.addField(
				'!deletewarns <@user> [reason]',
				'delete all warns from the user!'
			)
			.addField('!warnings <@user>', 'Checks the user warnings!')
			.addField('Economy', 'Money money money')
			.addField('!bal <@user>', 'checks the user balance!')
			.addField('!daily', 'claim your daily coins!')
			.addField('!buy <item name>', 'buy an item!')
			.addField('!shop', 'check out the available items using this command!')
			.addField(
				'Leveling',
				'A system to track down how active you are! Basically you get level up when you talk a lot in the server'
			)
			.addField('!level', 'Check your level!')
			.addField('Fun', 'some entertaining commands!')
			.addField('!owner', 'Umar Khorami')
			.addField('!meme', 'sends a meme duh')
			.addField('Others', 'other commands')
			.addField('!invite', 'invite the bot!')
			.addField('!help', 'the help command!');
		message.channel.send(helpembed);
	} // sends a help embed

	if (command === 'invite') {
		message.channel.send('https://discord.com/api/oauth2/authorize?client_id=871222812734521354&permissions=8&scope=bot');
	} // sends a bot invite link

	if (command === 'kick') {
		let target = message.mentions.users.first();
		if (target) {
			const memberTarget = message.guild.members.cache.get(target.id);
			memberTarget.kick();
			message.channel.send('User has been kicked');
		} else {
			message.channel.send(`You coudn't kick that member!`);
		} // if something goes wrong it will send this
	} // if everything is right then it will kicks the user and says that it works
	if (command === 'ban') {
		let target = message.mentions.users.first();
		if (target) {
			const memberTarget = message.guild.members.cache.get(target.id);
			memberTarget.ban();
			message.channel.send('User has been banned');
		} else {
			message.channel.send(
				`You either didn't state a user to ban or it is an invalid mentioned member or its a user that you can't ban`
			);
		}
	} // same thing as the kick lol

	if (command === 'owner') {
		message.channel.send('Bot is made by UMAR KHORAMI!');
	} // sends owner

	if (command === 'ping') {
		// let ping = message.createdTimeStamp - message.createdTimeStamp;
		// message.channel.send(`pong! my ping is *${ping}*`);
		  message.channel.send (`Pong! My ping is *${client.ws.ping}ms*`) // Replaced because the old one shows NaN
	} // shows the bot ping/ms

	if (command === 'level') {
		let user =
			message.mentions.users.first()

		let output = await leveling.Fetch(user.id);
		message.channel.send(
			`Hey ${user}, you are current at level ${output.level} with ${
				output.xp
			} xp!`
		);
	} // when a user use the level command it shows the user exp.

	if (command === 'warn') {
		let db = require('quick.db'); // npm i quick.db

		let user = message.mentions.members.first();
		if (!user)
			return message.channel.send(
				'Which user would you like to warn? Please mention the user by the way.'
			); // If User Is Not Provided
		let reason = args.slice(1).join(' '); // For Reason
		if (!reason) reason = 'No reason'; // If Reason Is Not Provided

		let embed = new Discord.MessageEmbed().setColor('RANDOM').setDescription(`
<@${user.id}> Was Warned For **${reason}** By <@${message.author.id}>
        `);
		message.channel.send(embed);
		db.add(`warns_${message.guild.id}_${user.id}`, 1); // `warns_${message.guild.id}_${user.id}` Because Warning Will be Different In All Server, If We Keep `warns_${user.id}` Then It Will Show Same Warnings In All Servers // Add 1 Warning To User
	}

	if (command === 'warnings') {
		let user = message.mentions.members.first();
		if (!user) return message.channel.send('Whose Warnings You Want To See?'); // If No User Is Provided

		let warnings = await db.fetch(`warns_${message.guild.id}_${user.id}`); // Get Users Warning
		if (warnings === null || warnings === 0) warnings = '0'; // If No Warning Are Their

		let embed = new Discord.MessageEmbed().setColor('RANDOM').setDescription(`
<@${user.id}> Has **${warnings}** Warnings
        `);
		message.channel.send(embed);
	}

	if (command === 'deletewarns') {
		let user = message.mentions.members.first();
		if (!user) return message.channel.send('Whom Do You Want To delete warns from?'); // If No User Is Provided


		message.channel.send(`<@${user.id}> has all warnings deleted`);
		db.delete(`warns_${message.guild.id}_${user.id}`);
	}

	if (command === 'meme') {
		const fetch = require('node-fetch');

		let meme = await fetch('https://meme-api.herokuapp.com/gimme').then(res =>
			res.json()
		); // From Where BOT Will Get Memes

		const embed = new Discord.MessageEmbed()
			.setTitle(meme.title)
			.setImage(meme.url);
		message.channel.send(embed);
	}

	if (command === 'bal') {
		const user = message.mentions.members.first();

		const db = require('quick.db');

		if (!user)
			return message.channel.send('Please state a user to check the balance!');

		let bal = db.fetch(`money_${user.id}`); // You Can Keep `money_${message.guild.id}_${user.id}` If You Want Different Amount In, Eg:- If I Am In 2 Servers And You Keep `money_${user.id}` I Will Have Same Money In Both Servers But If you Keep `money_${message.guild.id}_${user.id}` Then I Will Have Different Amount In Both Servers
		if (bal === null) bal = '0'; // If No Money In Wallet

		const embed = new Discord.MessageEmbed()
			.setColor('RANDOM')
			.setDescription(`You have ${bal} coins now!`);
		message.channel.send(embed);
	}

	if (command === 'buy') {
		if (!args[0]) message.channel.send('state something to buy please');
		if (args[0].toLowerCase() === 'laptop') {
			// You Can Keep Any Name
			const user = message.member;
			const amount = 10000; // Amount Of Laptop: $10,000
			const bal = db.fetch(`money_${user.id}`); // Get User's Money In Wallet

			if (bal < amount) {
				// If Balance In Wallet Is Less Then Amount Of Laptop
				return message.reply(
					`You Don't Have Enough Money(*10,000*) In Wallet To But Laptop`
				);
			} else {
				let items = db.fetch(message.author.id, { items: [] });
				db.push(message.author.id, 'laptop'); // Add 1 Laptop To User
				db.subtract(`money_${user.id}`, amount); // Remove Money From Using
				message.channel.send(
					`<@${user.id}> Successfully Purchased **1** *Laptop* For *$10,000*`
				);
			}
		}
	}

	if (command === 'shop') {
		const shopembed = new Discord.MessageEmbed()
			.setTitle('Shop!')
			.addField('laptop', '$10,000')
			.addField('house', '$1,000,000')
			.setFooter('To buy an item run !buy <Item name>');
		message.channel.send(shopembed);
	}

	if (command === 'buy') {
		if (!args[0]) message.channel.send('state something to buy please');

		if (args[0].toLowerCase() === 'house') {
			// You Can Keep Any Name
			const user = message.member;
			const amount = 1000000; // Amount Of Laptop: $10,000
			const bal = db.fetch(`money_${user.id}`); // Get User's Money In Wallet

			if (bal < amount) {
				// If Balance In Wallet Is Less Then Amount Of House
				return message.reply(
					`You Don't Have Enough Money(*$1,000,000*) In Wallet To Buy House!`
				);
			} else {
				db.push(message.author.id, 'house'); // Add 1 House To User
				db.subtract(`money_${user.id}`, amount); // Remove Money From Using
				message.channel.send(
					`<@${user.id}> Successfully Purchased **1** *House* For *$1,000,000*`
				);
			}
		}
	}

	if (command === 'daily') {
		const user = message.member;
		const timeout = 86400000; // 86400000 = 24 Hours
		const amount = 500000;
		const dailytime = db.fetch(`dailytime_${user.id}`);

		if (dailytime !== null && timeout - (Date.now() - dailytime) > 0) {
			// Check For CoolDown

			message.channel.send(
				'You have claimed your daily. Please come back later.'
			);
		} else {
			message.channel.send(`claimed $50000 coins! Come back next time!`);
			db.add(`money_${user.id}`, amount); // Add Amount To User's Wallet
			db.set(`dailytime_${user.id}`, Date.now()); // Set Time When Command Was Used
		}
	}

	if (command === 'inv') {
		let items = db.get(message.author.id);

		if (items === null) items = 'nothing poor';

		return message.channel.send('You have ' + items);
	}
});



const express = require("express");

const app = express();
app.get("/", (req, res) => {
  res.send("GET LINK TO UPTIMEROBOT");
});

app.listen(300, () => {
  console.log("Express Server");
});

client.login(process.env.token); // logging into the bot

// IF THERE IS ANY ERROR THAT WAS CAUSED BY YOUR CHANGES, IT IS NOT MY PROBLEM TO DEAL WITH IT! THIS COMMANDS HAS BEEN TESTED AND IS WORKING AS IT SHOULD BE!
