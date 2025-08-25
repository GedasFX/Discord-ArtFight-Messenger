import { ChatInputCommandInteraction, Client, MessageFlags, MessagePayload } from "discord.js";
import { getAttackEmbed } from "../parsers/parser-attack.js";

export const discord = new Client({ intents: [] });

discord.once("clientReady", () => {
  console.log(`Logged in as ${discord.user.tag}`);
});

discord.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  let deferred = false;
  let response;

  // Timer to defer if reply not sent in 2 seconds
  const deferTimer = setTimeout(async () => {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
      deferred = true;
    }
  }, 2000);

  try {
    if (interaction.commandName === "af") {
      response = await handleAfCommand(interaction);
    }

    clearTimeout(deferTimer);

    if (response) {
      await reply(interaction, response, deferred);
    }
  } catch (error) {
    clearTimeout(deferTimer);
    console.error("Error handling interaction:", error);

    if (error.cause === "user") {
      await reply(interaction, { content: `There was an error while processing your request: ${error.message}`, flags: MessageFlags.Ephemeral }, deferred);
    }
  }
});

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {MessagePayload | import("discord.js").InteractionReplyOptions} content
 * @param {boolean} deferred
 */
async function reply(interaction, content, deferred) {
  if (deferred && !interaction.replied) {
    await interaction.editReply(content);
  } else if (interaction.replied || interaction.deferred) {
    await interaction.followUp(content);
  } else {
    await interaction.reply(content);
  }
}


/**
 * @param {ChatInputCommandInteraction} interaction
 * @returns {Promise<MessagePayload | import("discord.js").InteractionReplyOptions>}
 */
async function handleAfCommand(interaction) {
  const url = interaction.options.getString("url");
  if (!url) {
    throw new Error("URL is required.", { cause: "user" });
  }

  const embed = await getAttackEmbed(url);
  return { embeds: [embed] };
}
