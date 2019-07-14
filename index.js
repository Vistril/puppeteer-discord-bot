console.log("start");
(async () => {
	var fs = require("fs");
	var puppeteer = require('puppeteer');
	var browser = await puppeteer.launch();

	var Discord = require('discord.io');
	var bot = new Discord.Client({
		token: fs.readFileSync('token.txt','utf8').trim(),
		autorun: true
	});
	bot.setPresence({game: {name: "p!help"}});

	bot.on("message", function(userName, userID, channelID, message, event){
		if (!message.startsWith("p!")) return;

		console.log(`[${new Date().toLocaleString()}] [${event.d.guild_id}(${bot.servers[event.d.guild_id]&&bot.servers[event.d.guild_id].name})] [${channelID}(#${bot.channels[channelID]&&bot.channels[channelID].name})] User ${userID} (${userName}#${event.d.author.discriminator}) invoked command: ${message}`);

		var args = message.split(" ");
		var cmd = args[0].slice(2).toLowerCase();
		var query = args.slice(1).join(" ");

		switch (cmd) {
			case "help":
			case "h":
				bot.sendMessage({embed:{
					title: "Commands",
					description:
						"\n`p!screenshot <url>`"+
						"\n`p!google <query>`"+
						"\n`p!google-images <query>`"+
						"\n`p!bing <query>`"+
						"\n`p!bing-images <query>`"+
						"\n`p!youtube <query>`"+
						"\n`p!ebay <query>`" +
						"\n`p!amazon <query>`" +
						"\n\n[» Invite](https://discordapp.com/oauth2/authorize?scope=bot&client_id=482784865532641290)"+
						"\n[» Repository](https://github.com/ledlamp/puppeteer-discord-bot)"+
						"\n[» Submit an issue](https://github.com/ledlamp/puppeteer-discord-bot/issues/new)"
				}, to: channelID});
				break;
			case "screenshot":
			case "ss":
				pup((query.startsWith("http://") || query.startsWith("https://")) ? query : `http://${query}`);
				break;
			case "google":
			case "g":
				pup(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
				break;
			case "google-images":
			case "gi":
				pup(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&safe=${(bot.channels[channelID] && bot.channels[channelID].nsfw) ? 'off' : 'on'}`);
				break;
			case "bing":
			case "b":
				pup(`https://www.bing.com/search?q=${encodeURIComponent(query)}`);
				break;
			case "bing-images":
			case "bi":
				pup(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&safeSearch=${(bot.channels[channelID] && bot.channels[channelID].nsfw) ? 'off' : 'moderate'}`);
				break;
			case "youtube":
			case "yt":
				pup(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
				break;
			case "ebay":
			case "e":
				pup(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`);
				break;
			case "amazon":
			case "a":
				pup(`https://www.amazon.com/s?k=${encodeURIComponent(query)}`);
				break;
			case "google-lucky":
			case "im-feeling-lucky":
			case "imfeelinglucky":
			case "lucky":
			case "gl":
				pup(`https://www.google.com/search?btnI=I%27m+Feeling+Lucky&q=${encodeURIComponent(query)}`);
				break;
/*
			case "":
			case "":
				pup(``);
				break;
*/

			case "eval":
			case ">":
				if (userID == "281134216115257344") {
					try {
						bot.sendMessage({message: eval(query), to: channelID});
					} catch(e) {
						bot.sendMessage({message: e, to: channelID});
					}
				}
				break;
		}

		async function pup(url) {
			bot.addReaction({reaction:'🆗', channelID, messageID: event.d.id});
			try {
				var page = await browser.newPage();
				page.on("error", error => {
					bot.sendMessage({message: `:warning: ${error.message}`, to: channelID});
				});
				await page.setViewport({width: 1440, height: 900});
				await page.goto(url);
				var screenshot = await page.screenshot({type: 'png'});
				bot.uploadFile({file: screenshot, filename: "screenshot.png", to: channelID});
			} catch(error) {
				console.error(error);
				bot.sendMessage({message: `:warning: ${error.message}`, to: channelID});
			} finally {
				try {
					await page.close();
				} catch(e) {
					console.error(e);
					process.exit(1);
				}
			}
		}
	});
})();
