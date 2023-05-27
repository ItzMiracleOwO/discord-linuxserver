const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const si = require("systeminformation");

async function getData() {
  try {
    const getObject = {
      cpu: "manufacturer, brand, speed",
      osInfo: "platform, release",
      mem: "total, free, used, cached",
      dockerInfo: "containers, containersRunning",
      currentLoad: "avgLoad, currentLoad",
    };

    const data = await si.get(getObject);
    return data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Show server status"),
  category: "mdesk",

  async execute(interaction) {
    const client = interaction.client;
    try {
      await interaction.deferReply({
        content: "Please wait...",
        fetchReply: true,
      });
      getData().then(async (d) => {
        const CLoad = Math.round(d.currentLoad.currentLoad);
        const ALoad = Math.round(d.currentLoad.avgLoad);

        const StatusEmbed = new EmbedBuilder()
          .setColor("Random")
          .setTitle("mDesk Status")
          .setDescription(`Websocket heartbeat: ${client.ws.ping}ms`)
          .addFields(
            {
              name: "CPU",
              value:
                `Manufacturer: ${d.cpu.manufacturer}\n` +
                `Brand: ${d.cpu.brand}\n` +
                `Frequency: ${d.cpu.speed}` +
                `Average Load: ${ALoad}` +
                " " +
                `Current Load: ${CLoad}`,
              inline: true,
            },
            {
              name: "Memory",
              value:
                `Total: ${d.mem.total}\n` +
                `Used: ${d.mem.used}\n` +
                `Free: ${d.mem.free}\n` +
                `Cached: ${d.mem.cached}`,
              inline: true,
            },
            { name: "\u200B", value: "\u200B" },
            {
              name: "OS",
              value:
                `Platform: ${d.osInfo.platform}\n` +
                `Release: ${d.osInfo.release}`,
              inline: true,
            },
            {
              name: "Docker",
              value:
                `Containers: ${d.dockerInfo.containers}\n` +
                `Containers Running: ${d.dockerInfo.containersRunning}`,
              inline: true,
            }
          )
          .setTimestamp()
          .setFooter({
            text: "mDesk by mTech",
          });

        await interaction.editReply({ embeds: [StatusEmbed] });
      });
    } catch (e) {
      client.log(e, "error");
      await interaction.editReply({
        content: "An error occur!",
        embeds: [],
        components: [],
        fetchReply: true,
      });
    }
  },
};
