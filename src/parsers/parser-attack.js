import { EmbedBuilder } from "discord.js";
import { getBrowser } from "../managers/manager-browser.js";

/**
 * 
 * @param {string} url 
 */
async function loadPage(url) {
  const browser = await getBrowser();

  const page = await browser.newPage();

  // Disable image loading
  await page.route("**/*.{png,jpg,jpeg,gif,webp,svg,js,css}*", (route) => route.abort());
  await page.goto(url, { waitUntil: "domcontentloaded" });

  if (page.url() !== url) {
    throw new Error(`URL redirected to ${page.url()}`, { cause: 'system' });
  }

  const doc = await extractAttackInfoFromPage(page);

  await page.close();

  return doc;
}

/**
 * @param {import("patchright").Page} page
 * @returns
 */
async function extractAttackInfoFromPage(page) {
  return await page.evaluate(() => {
    const attackContent = document.getElementById("attack-content");

    return {
      header: extractAttackHeader(),
      main: extractMainContent(),
      info: extractAttackInfo(),
      stats: extractAttackStats(),
      revengeChain: extractRevengeChain(),
      contentWarnings: extractContentWarnings(),
    };

    function extractAttackHeader() {
      const header = document.querySelector(".profile-header");

      return {
        title: header.querySelector(".profile-header-name u").textContent.trim(),
        url: new URL(header.querySelector(".profile-header-name a").getAttribute("href")).toString(),
        thumbnail: (() => {
          const style = header.querySelector("div.profile-avatar-wrapper span.icon-attack")?.getAttribute("style") || "";
          const match = /url\((https:\/\/.*)\);/.exec(style);
          return match ? new URL(match[1]).toString() : null;
        })(),
        date: new Date(document.querySelector(".profile-header-normal-status div:nth-child(2)").childNodes[1].textContent + " UTC-6"),
      };
    }

    function extractMainContent() {
      return {
        imageUrl: new URL(attackContent.querySelector("img").getAttribute("src")).toString(),
        description: attackContent.querySelector(".clearfix")?.textContent.trim(),
      };
    }

    function extractAttackInfo() {
      const data = pullFromTable();

      return {
        attacker: data[0]?.value ? { name: data[0].value, url: new URL(data[0].href, window.origin).toString(), color: data[0].color } : null,
        defender: data[1]?.value ? { name: data[1].value, url: new URL(data[1].href, window.origin).toString(), color: data[1].color } : null,
        team: data[2]?.value
          ? {
              name: data[2].value,
              url: new URL(data[2].href, window.origin).toString(),
              id: Number(/\/team\/(\d+)\.\w+/.exec(data[2].href)[1]),
              color: data[2].color,
            }
          : null,
        characters: data.slice(3).map((item) => ({
          type: item.key.slice(0, -1),
          name: item.value,
          url: new URL(item.href, window.origin).toString(),
          color: item.color,
        })),
      };

      function pullFromTable() {
        const cardHeaders = attackContent.querySelectorAll(".card-header");
        for (const cardHeader of cardHeaders) {
          if (cardHeader.innerHTML.trim() === "Attack Info") {
            const table = cardHeader.nextElementSibling;
            if (table) {
              const rows = table.querySelectorAll("tr");
              return Array.from(rows).map((row) => {
                const columns = row.querySelectorAll("td");
                return {
                  key: columns[0]?.textContent.trim(),
                  value: columns[1]?.textContent.trim(),
                  href: columns[1]?.querySelector("a")?.getAttribute("href"),
                  color: columns[1]
                    ?.querySelector("a")
                    ?.getAttribute("style")
                    ?.match(/color:\s*([^;]+)/)?.[1],
                };
              });
            }
            break;
          }
        }
      }
    }

    function extractAttackStats() {
      const data = pullFromTable();

      if (data[data.length - 1].key === "Polished") {
        data[data.length - 1].value = "Yes";
      } else {
        data.push({
          key: "Polished",
          value: "No",
        });
      }

      if (data[0].value.indexOf("Friendly Fire") > -1) {
        data[0].value = data[0].value.split("\n")[0];
        data.push({
          key: "Friendly Fire",
          value: "Yes",
        });
      } else {
        data.push({
          key: "Friendly Fire",
          value: "No",
        });
      }

      return {
        points: Number(data[0].value),
        isPolished: data.find((x) => x.key === "Polished").value === "Yes",
        isFriendlyFire: data.find((x) => x.key === "Friendly Fire").value === "Yes",
        stats: data.slice(1, -2).map((item) => ({
          key: item.key.slice(0, -1),
          value: item.value,
        })),
      };

      function pullFromTable() {
        const cardHeaders = attackContent.querySelectorAll(".card-header");
        for (const cardHeader of cardHeaders) {
          if (cardHeader.innerHTML.trim() === "Attack Stats") {
            const table = cardHeader.nextElementSibling;
            if (table) {
              const rows = table.querySelectorAll("tr");
              return Array.from(rows).map((row) => {
                const columns = row.querySelectorAll("td");
                return {
                  key: columns[0]?.textContent.trim(),
                  value: columns[1]?.textContent.trim(),
                };
              });
            }
            break;
          }
        }
      }
    }

    function extractRevengeChain() {
      const cardHeaders = attackContent.querySelectorAll(".card-header");

      for (const cardHeader of cardHeaders) {
        if (cardHeader.innerHTML.trim().includes("Revenge chain")) {
          const level = /Revenge chain \(Level: (\d+)\)/.exec(cardHeader.textContent.trim())[1];

          const revengePanel = cardHeader.nextElementSibling;
          if (revengePanel) {
            const chainTitles = revengePanel.querySelectorAll("td.bg-light");
            const hyperlinks = revengePanel.querySelectorAll("a");

            let previousAttack, nextAttack;

            // Case when only previous or both are present
            if (chainTitles[0].textContent.trim() === "Previous") {
              previousAttack = {
                title: hyperlinks[1].textContent.trim(),
                url: new URL(hyperlinks[1].getAttribute("href")).toString(),
                thumbnailUrl: new URL(hyperlinks[0].querySelector("img").getAttribute("src")).toString(),
              };
            }

            // Case when only next is present
            if (chainTitles[0].textContent.trim() === "Next") {
              nextAttack = {
                title: hyperlinks[1].textContent.trim(),
                url: new URL(hyperlinks[1].getAttribute("href")).toString(),
                thumbnailUrl: new URL(hyperlinks[0].querySelector("img").getAttribute("src")).toString(),
              };
            }

            // Case when both previous and next are present
            if (chainTitles[1]?.textContent.trim() === "Next") {
              nextAttack = {
                title: hyperlinks[3].textContent.trim(),
                url: new URL(hyperlinks[3].getAttribute("href")).toString(),
                thumbnailUrl: new URL(hyperlinks[2].querySelector("img").getAttribute("src")).toString(),
              };
            }

            return {
              previous: previousAttack,
              next: nextAttack,
              level: Number(level),
            };
          }
          break;
        }
      }

      return null;
    }

    function extractContentWarnings() {
      const maybeWarning = attackContent.previousElementSibling;
      if (maybeWarning && maybeWarning.classList.contains("alert-warning")) {
        const match = maybeWarning.textContent.trim().match(/^This attack has the following filters: (.+)$/);
        return match ? match[1] : null;
      }
      return null;
    }
  });
}

/**
 * 
 * @param {string} url 
 * @returns 
 */
export async function getAttackEmbed(url) {
  const match = url.match(/https:\/\/artfight.net\/attack\/(\d+)/);
  if (match) {
    url = `https://artfight.net/attack/${match[1]}`;
  } else if (!isNaN(Number(url))) {
    url = `https://artfight.net/attack/${url}`;
  } else {
    throw new Error("Invalid URL or ID", { cause: 'user' });
  }

  const parsed = await loadPage(url);

  const embed = new EmbedBuilder();
  embed.setTitle(getAttackTitle(parsed.header.title, parsed.stats.isPolished));
  embed.setFooter(getAttackFooter(parsed.stats.points, parsed.stats.isFriendlyFire));
  embed.setURL(parsed.header.url);
  embed.setImage(parsed.main.imageUrl);
  embed.setThumbnail(parsed.header.thumbnail);
  embed.setTimestamp(parsed.header.date);
  embed.setColor(parsed.info.team.color);

  if (parsed.main.description) {
    embed.setDescription(parsed.main.description);
  }

  if (parsed.info.attacker) {
    embed.addFields({
      name: "From:",
      value: `[${parsed.info.attacker.name}](${parsed.info.attacker.url})`,
      inline: true,
    });
  }

  if (parsed.info.defender) {
    embed.addFields({
      name: "To:",
      value: `[${parsed.info.defender.name}](${parsed.info.defender.url})`,
      inline: true,
    });
  }

  if (parsed.revengeChain) {
    const data = parsed.revengeChain;

    let text = "";

    if (data.previous) {
      text += `⏮️ [${data.previous.title}](${data.previous.url})`;
    }
    if (text && data.next) {
      text += " | ";
    }
    if (data.next) {
      text += `[${data.next.title}](${data.next.url}) ⏭️`;
    }

    embed.addFields({
      name: `Revenge Chain (Level: ${data.level})`,
      value: text,
      inline: false,
    });
  }

  if (parsed.contentWarnings) {
    embed.addFields({ name: 'Content Warnings:', value: parsed.contentWarnings, inline: false });
  }

  return embed;
}

/**
 * @param {string} title 
 * @param {boolean} polished 
 * @returns 
 */
function getAttackTitle(title, polished) {
  if (polished) {
    return `✨ ${title} ✨`;
  }
  return title;
}

/**
 * @param {number} points
 * @param {boolean} friendlyFire
 * @returns 
 */
function getAttackFooter(points, friendlyFire) {
  let text = '';

  if (friendlyFire) {
    text += 'Friendly Fire';
  }
  if (text && points) {
    text += ' | ';
  }
  if (points === 1) {
    text += `${points} point`;
  } else if (points > 1) {
    text += `${points} points`;
  }

  return {
    text
  };
}