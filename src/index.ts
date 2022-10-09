import discord from "discord.js";
import { channelMention } from "@discordjs/builders";
import dotenv from "dotenv";

const prefix = "ts!";

dotenv.config();

const client = new discord.Client({
    intents: ["Guilds", "GuildMessages", "MessageContent"],
});

client.on("ready", () => {
    console.log("Bot online");
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    let { content, guild, author } = message;

    if (!content.startsWith(prefix)) return;
    content = content.substring(prefix.length);

    const args = content.split(/[ +]/g);

    const command = args.shift()?.toLowerCase();

    if (command === "ping") {
        await message.reply("Pong!");
        await message.react("🏓");

        const embed = new discord.EmbedBuilder()
            .setColor("Blue")
            .setTitle("Thankyou for your useless message")
            .setURL("https://discord.js.org/")
            .setAuthor({
                name: "Some name",
                iconURL: "https://i.imgur.com/AfFp7pu.png",
                url: "https://discord.js.org",
            })
            .setDescription("Some description here")
            .setThumbnail("https://i.imgur.com/AfFp7pu.png")
            .addFields(
                { name: "Regular field title", value: "Some value here" },
                { name: "\u200B", value: "\u200B" },
                {
                    name: "Inline field title",
                    value: "Some value here",
                    inline: true,
                },
                {
                    name: "Inline field title",
                    value: "Some value here",
                    inline: true,
                }
            )
            .addFields({
                name: "Inline field title",
                value: "Some value here",
                inline: true,
            })
            .setImage("https://i.imgur.com/AfFp7pu.png")
            .setTimestamp()
            .setFooter({
                text: "Some footer text here",
                iconURL: "https://i.imgur.com/AfFp7pu.png",
            });
        await message.reply({ embeds: [embed] });
    } else if (command === "game") {
        if (guild === null) return;
        const gameChannel = await guild.channels.create({
            name: "game",
        });
        message.channel.send(
            `Channel Created! Go to ${channelMention(gameChannel.id)}`
        );

        const embed = new discord.EmbedBuilder()
            .setColor("Random")
            .setTitle("Welcome to the game")
            .addFields(
                { name: "Rules", value: "*you need to follow these*" },
                {
                    name: "You have 5 guesses",
                    value: "Try guess the correct word",
                }
            )
            .setTimestamp();

        await gameChannel.send({ embeds: [embed] });

        const words = ["hello", "world", "my", "name", "is"];

        const word = words[Math.floor(Math.random() * words.length)];

        await gameChannel.send(`DEBUG: word = ${word}`);

        const correctGuesses: string[] = [];
        let chances = 5;

        const collector = gameChannel.createMessageCollector({
            idle: 1000 * 60 * 3,
            filter: (message) => {
                return !message.author.bot;
            },
        });

        collector.on("collect", async (guessMessage) => {
            if (word.includes(guessMessage.content[0].toLowerCase())) {
                correctGuesses.push(guessMessage.content[0].toLowerCase());
            } else {
                chances--;
            }

            if (chances === 0) {
                await gameChannel.send("Game over, you lose");
                await message.reply("Game over, you lost");
                collector.stop();
                return;
            }

            let wordString = "";
            for (const character of word) {
                if (correctGuesses.includes(character)) {
                    wordString += character;
                } else {
                    wordString += "_";
                }
            }

            if (wordString === word) {
                await gameChannel.send("You win! The word was " + wordString);
                await message.reply("You won! The word was " + wordString);
                collector.stop();
                return;
            }

            gameChannel.send(
                `Your current word is: \`\`${wordString}\`\`, you have ${chances} chances left!`
            );
        });

        collector.on("end", (collected) => {
            setTimeout(function () {
                gameChannel.delete();
            }, 1000 * 10);
        });
    }
    // // Reply to a message
    // await message.reply("**Thank you for your useless message**");
});

client.login(process.env.BOT_TOKEN);
