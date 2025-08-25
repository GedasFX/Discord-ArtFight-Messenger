import { ChatInputCommandInteraction, Client, MessageFlags, MessagePayload } from "discord.js";
import { getAttackEmbed } from "../parsers/parser-attack.js";

export const discord = new Client({ intents: [] });

discord.once("clientReady", () => {
  console.log(`Logged in as ${discord.user.tag}`);
});

discord.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  try {
    let response;

    if (interaction.commandName === "af") {
      await interaction.deferReply();
      response = await handleAfCommand(interaction);
    }

    if (response) {
      await reply(interaction, response);
    }
    
  } catch (error) {
    console.error("Error handling interaction:", error);

    if (error.cause === "user") {
      await reply(interaction, { content: `There was an error while processing your request: ${error.message}`, ephemeral: true }, processTimer);
    }
  }
});

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {MessagePayload | import("discord.js").InteractionReplyOptions} content
 */
async function reply(interaction, content) {
  await interaction.followUp(content);
}


/**
 * @param {ChatInputCommandInteraction} interaction
 * @returns
 */
async function handleAfCommand(interaction) {
  const url = interaction.options.getString("url");
  if (!url) {
    return { content: "URL is required.", ephemeral: true };
  }

  const embed = await getAttackEmbed(url);
  return { embeds: [embed] };
}
