"use strict"

const { release } = require("os");
const { executeSNKRS, executeNIKE, executeGSLINKS, executeEULINKS } = require("../main.js");
require("dotenv").config();
const { REST, Routes, Client, IntentsBitField, EmbedBuilder} = require("discord.js");
let embeds = new EmbedBuilder();
const commandsChannelId = ""; // Add your channel ID here where to use the bot
const releaseChannelId = ""; // same here BUT this will be used only by ownerID!
const ownerId = ""; // this is only if you want to use it for yourself in a server, other people won't have access.

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
     ],
});

const rest = new REST({ version: 10 }).setToken(process.env.TOKEN);

// Registered commands in discord
const commands = [
    {
        name: "snkrs",
        description:"Type /snkrs [SKU] [REGION] to get live releases from SNKRS.",
        options: [
            {
                name: "region",
                description: "Nike SNKRS Region",
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "nike",
        description:"Type /nike [SKU] [REGION] to get informations about a Nike product.",
        options: [
            {
                name: "sku",
                description: "Nike product StyleColor",
                type: 3,
                required: true
            },
            {
                name: "region",
                description: "Nike SNKRS Region",
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "gslinks",
        description:"Type /gslinks [SKU] [REGION] to get checkout links for every size.",
        options: [
            {
                name: "sku",
                description: "Nike SNKRS product SKU",
                type: 3,
                required: true
            },
            {
                name: "region",
                description: "Nike SNKRS Region",
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "eulinks",
        description:"Type /eulinks [SKU] [REGION] to get checkout links for every size.",
        options: [
            {
                name: "sku",
                description: "Nike SNKRS product SKU",
                type: 3,
                required: true
            },
            {
                name: "region",
                description: "Nike SNKRS EU region",
                type: 3,
                required: true
            }
        ]
    },
  ];
    
async function registerCommands() {
    try {
        console.log ("Registering slash commands...");
        await rest.put (
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {body: commands}
        )
    } catch (error) {
        console.log ("There was an error:", error)
    }
};

client.on("interactionCreate", async interaction => {
    const commandName = interaction.commandName;   
    if (!interaction.isCommand()) interaction.reply(`Command ${commandName} doesnt exist!`);
    if (interaction.channelId == commandsChannelId || interaction.channelId == releaseChannelId && interaction.user.id == ownerId) {
    if(commandName === "snkrs") {
        await executeSNKRS(interaction);
    } else if (commandName === "nike") {
        await executeNIKE(interaction);
    } else if (commandName === "gslinks") {
        await executeGSLINKS(interaction);
    } else if (commandName === "eulinks") {
        await executeEULINKS(interaction);
    }
    } else {
        interaction.reply(`You can use the bot in #nike-commands!`)
    }
})
registerCommands() //Register commands from code to discord

client.login (process.env.TOKEN); //Bot login
