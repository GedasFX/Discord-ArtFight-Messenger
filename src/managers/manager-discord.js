import { ChatInputCommandInteraction, Client, MessageFlags, MessagePayload } from "discord.js";
import { getAttackEmbed } from "../parsers/parser-attack.js";

export const discord = new Client({ intents: [] });

discord.once("clientReady", () => {
  console.log(`Logged in as ${discord.user.tag}`);
});

discord.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const processTimer = startProcessTimer(interaction);

  try {
    {
      if (interaction.commandName === "af") {
        await handleAfCommand(interaction);
      }
    }
  } catch (error) {
    console.error("Error handling interaction:", error);

    if (error.cause === 'user') {
      await reply(interaction, { content: `There was an error while processing your request: ${error.message}`, ephemeral: true });
    }
  } finally {
    clearProcessTimer(processTimer);
  }
});

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
async function handleAfCommand(interaction) {
  const url = interaction.options.getString("url");
  if (!url) {
    await reply(interaction, { content: "URL is required.", ephemeral: true });
    return;
  }

  const embed = await getAttackEmbed(url);
  await reply(interaction, { embeds: [embed] });
}

function startProcessTimer(interaction) {
  return setTimeout(async () => {
    await interaction.deferReply();
  }, 2500);
}

function clearProcessTimer(timer) {
  clearTimeout(timer);
}

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @param {MessagePayload | import("discord.js").InteractionReplyOptions} content 
 */
async function reply(interaction, content) {
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(content);
  } else {
    await interaction.reply(content);
  }
}