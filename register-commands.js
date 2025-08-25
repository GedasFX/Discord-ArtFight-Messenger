import { REST, Routes, SlashCommandBuilder, InteractionContextType } from "discord.js";
import { config } from "dotenv";

config(); // Load environment variables from .env file

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  console.error("Missing environment variables: TOKEN or CLIENT_ID");
  process.exit(1);
}

const afCommand = new SlashCommandBuilder()
  .setName("af")
  .setDescription("Post an attack")
  .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
  .addStringOption((o) => o.setName("url").setDescription("URL or ID of the attack").setRequired(true))
  .toJSON();

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: [afCommand],
    });
    console.log("Slash commands registered.");
  } catch (error) {
    console.error(error);
  }
}

registerCommands();
