const config = require("config");
const moment = require("moment");
const path = require("node:path");
const { existsSync } = require("node:fs");
const { createCanvas, registerFont, loadImage } = require("canvas");
const { getItemFile } = require("../ports/albion");

const { hasAwakening, transformTrait } = require("../helpers/albion");
const { optimizeImage } = require("../helpers/images");
const { digitsFormatter, fileSizeFormatter } = require("../helpers/utils");
const logger = require("../helpers/logger");
const { memoize } = require("../helpers/cache");
const { SECOND } = require("../helpers/constants");

const assetsPath = path.join(__dirname, "..", "assets");

registerFont(path.join(assetsPath, "fonts", "Roboto-Regular.ttf"), {
  family: "Roboto",
  weight: "Normal",
});

const drawImage = async (ctx, src, x, y, sw, sh) => {
  if (!src) return;
  let img;
  try {
    img = await loadImage(src);
  } catch (e) {
    logger.error(`[images] Error loading image: ${src} (${e})`);
    img = await loadImage(path.join(assetsPath, "notfound.png"));
  }
  if (sw && sh) ctx.drawImage(img, x, y, sw, sh);
  else ctx.drawImage(img, x, y);
};

const drawItem = async (ctx, item, x, y, { size = 217, attunedPlayerName } = {}) => {
  if (!item) return await drawImage(ctx, path.join(assetsPath, "slot.png"), x, y, size, size);
  const itemImage = await getItemFile(item);
  await drawImage(ctx, itemImage, x, y, size, size);

  // draw not attuned icon
  if (
    attunedPlayerName &&
    item.LegendarySoul?.attunedPlayerName &&
    item.LegendarySoul?.attunedPlayerName !== attunedPlayerName
  ) {
    const notAttunedSize = size / 3.5;
    await drawImage(
      ctx,
      path.join(assetsPath, "notAttuned.png"),
      x + size - notAttunedSize - size * 0.15,
      y + size * 0.15,
      notAttunedSize,
      notAttunedSize,
    );
  }

  ctx.save();
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = Math.round(size / 40);
  ctx.font = `${Math.round(size / 7.5)}px Roboto`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(item.Count, x + size * 0.76, y + size * 0.73);
  ctx.fillText(item.Count, x + size * 0.76, y + size * 0.73);
  ctx.restore();
};

const drawTrait = async (ctx, trait, x, y) => {
  const { name, type, value, unit, relativeValue } = transformTrait(trait);
  ctx.save();

  // Draw icon
  if (config.get("features.events.displayTraitIcons")) {
    const iconSrc = path.join(assetsPath, "traits", `${type}.png`);
    if (existsSync(iconSrc)) {
      const icon = await loadImage(iconSrc);
      ctx.drawImage(icon, x, y - 25, 50, 50);
    }
    x += 70;
  }

  // Draw text
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.font = config.get("features.events.displayTraitIcons") ? "26px Roboto" : "30px Roboto";
  ctx.strokeText(`+${value}${unit} ${name}`, x, y);
  ctx.fillText(`+${value}${unit} ${name}`, x, y);
  y += 20;

  // Draw bar
  const maxBarWidth = config.get("features.events.displayTraitIcons") ? 350 : 420;
  const barHeight = 10;
  ctx.fillStyle = ctx.createPattern(await loadImage(path.join(assetsPath, "assistBarBg.png")), "repeat");
  ctx.fillRect(x, y, maxBarWidth, barHeight);
  ctx.fillStyle = "#0dd621";
  ctx.fillRect(x, y, relativeValue * maxBarWidth, barHeight);

  // Draw gradient over the bar
  const barGradient = ctx.createLinearGradient(x + maxBarWidth / 2, y, x + maxBarWidth / 2, y + barHeight);
  barGradient.addColorStop(0, "rgba(255, 255, 255, 0.85)");
  barGradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  barGradient.addColorStop(1, "rgba(0, 0, 0, 0.5)");
  ctx.fillStyle = barGradient;
  ctx.fillRect(x, y, relativeValue * maxBarWidth, barHeight);

  ctx.restore();
};

const drawAwakening = async (ctx, weapon, x, y, { size = 145, attunedPlayerName } = {}) => {
  x += 30;
  await drawItem(ctx, weapon, x, y + 60, { size, attunedPlayerName });

  x += size + 15;
  y += 40;

  if (weapon.LegendarySoul.traits.length === 0) {
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.font = "38px Roboto";
    ctx.strokeText("<No traits>", x + 100, y + 100);
    ctx.fillText("<No traits>", x + 100, y + 100);
  }

  for (const trait of weapon.LegendarySoul.traits) {
    drawTrait(ctx, trait, x, y);
    y += 80;
  }
};

const drawPlayer = async (ctx, player, x, y, { showAttunement } = {}) => {
  const BLOCK_SIZE = 217;

  ctx.beginPath();
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";

  let guild = "";
  if (player.GuildName) guild = player.GuildName;
  if (player.AllianceName) guild = `[${player.AllianceName}] ${guild}`;
  ctx.font = "35px Roboto";
  ctx.lineWidth = 3;
  ctx.fillStyle = "#FFF";
  let tw = ctx.measureText(guild).width;
  let th = ctx.measureText("M").width;
  y += th * 2;
  ctx.strokeText(guild, x + BLOCK_SIZE * 1.5 - tw / 2, y);
  ctx.fillText(guild, x + BLOCK_SIZE * 1.5 - tw / 2, y);
  y += th * 2;

  const name = `${player.Name}`;
  ctx.font = "60px Roboto";
  ctx.lineWidth = 6;
  tw = ctx.measureText(name).width;
  th = ctx.measureText("M").width;
  ctx.strokeText(name, x + BLOCK_SIZE * 1.5 - tw / 2, y);
  ctx.fillText(name, x + BLOCK_SIZE * 1.5 - tw / 2, y);
  y += th - 5;

  const ip = `IP: ${Math.round(player.AverageItemPower)}`;
  ctx.font = "33px Roboto";
  ctx.fillStyle = "#AAAAAA";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  tw = ctx.measureText(ip).width;
  th = ctx.measureText("M").width;
  ctx.strokeText(ip, x + BLOCK_SIZE * 1.5 - tw / 2, y);
  ctx.fillText(ip, x + BLOCK_SIZE * 1.5 - tw / 2, y);
  y += th;

  const equipment = player.Equipment;
  await drawItem(ctx, equipment.Head, x + BLOCK_SIZE, y);
  await drawItem(ctx, equipment.Armor, x + BLOCK_SIZE, y + BLOCK_SIZE);
  await drawItem(ctx, equipment.MainHand, x, y + BLOCK_SIZE, { attunedPlayerName: player.Name });
  // Two-handed equipment
  if (equipment.MainHand && equipment.MainHand.Type.split("_")[1] == "2H") {
    ctx.globalAlpha = 0.2;
    await drawItem(ctx, equipment.MainHand, x + BLOCK_SIZE * 2, y + BLOCK_SIZE);
    ctx.globalAlpha = 1;
  } else {
    await drawItem(ctx, equipment.OffHand, x + BLOCK_SIZE * 2, y + BLOCK_SIZE);
  }
  await drawItem(ctx, equipment.Shoes, x + BLOCK_SIZE, y + BLOCK_SIZE * 2);
  await drawItem(ctx, equipment.Bag, x, y);
  await drawItem(ctx, equipment.Cape, x + BLOCK_SIZE * 2, y);
  await drawItem(ctx, equipment.Mount, x + BLOCK_SIZE, y + BLOCK_SIZE * 3);
  await drawItem(ctx, equipment.Potion, x, y + BLOCK_SIZE * 2);
  await drawItem(ctx, equipment.Food, x + BLOCK_SIZE * 2, y + BLOCK_SIZE * 2);

  y += BLOCK_SIZE * 4;

  // Awakened weapon
  if (showAttunement && equipment.MainHand?.LegendarySoul) {
    await drawAwakening(ctx, equipment.MainHand, x, y, { attunedPlayerName: player.Name });
  }

  ctx.closePath();
};

const drawTimestamp = async (ctx, event, x, y, { iconSize = 75 } = {}) => {
  ctx.beginPath();
  ctx.font = "35px Roboto";
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  const timestamp = moment.utc(event.TimeStamp).format("YYYY.MM.DD HH:mm");
  const textWidth = ctx.measureText(timestamp).width;
  const textHeight = ctx.measureText("M").width;
  await drawImage(ctx, path.join(assetsPath, "time.png"), x - iconSize / 2, y, iconSize, iconSize);
  ctx.strokeText(timestamp, x - textWidth / 2, y + iconSize + textHeight + 15);
  ctx.fillText(timestamp, x - textWidth / 2, y + iconSize + textHeight + 15);
  ctx.closePath();
};

const drawFame = async (ctx, event, x, y, { iconSize = 100 } = {}) => {
  ctx.beginPath();
  ctx.font = "40px Roboto";
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  const fame = digitsFormatter(event.TotalVictimKillFame);
  const textWidth = ctx.measureText(fame).width;
  const textHeight = ctx.measureText("M").width;
  await drawImage(ctx, path.join(assetsPath, "fame.png"), x - iconSize / 2, y, iconSize, iconSize);
  ctx.strokeText(fame, x - textWidth / 2, y + iconSize + textHeight + 15);
  ctx.fillText(fame, x - textWidth / 2, y + iconSize + textHeight + 15);
  ctx.closePath();
};

const drawLootValue = async (ctx, lootValue, x, y, { iconSize = 100, splitLootValue } = {}) => {
  const lootSum = splitLootValue ? lootValue.equipment : lootValue.equipment + lootValue.inventory;
  if (!lootSum) return;

  ctx.beginPath();
  ctx.font = "40px Roboto";
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  const lootValueText = digitsFormatter(lootSum);
  const textWidth = ctx.measureText(lootValueText).width;
  const textHeight = ctx.measureText("M").width;
  await drawImage(ctx, path.join(assetsPath, "lootValue.png"), x - iconSize / 2, y, iconSize, iconSize);
  ctx.strokeText(lootValueText, x - textWidth / 2, y + iconSize + textHeight + 15);
  ctx.fillText(lootValueText, x - textWidth / 2, y + iconSize + textHeight + 15);
  ctx.closePath();
};

const drawAssistCount = async (ctx, assistCount, x, y, { iconSize = 100 } = {}) => {
  ctx.beginPath();
  ctx.font = "40px Roboto";
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  const assistCountText = digitsFormatter(assistCount);
  const textWidth = ctx.measureText(assistCountText).width;
  const textHeight = ctx.measureText("M").width;
  await drawImage(ctx, path.join(assetsPath, "assists.png"), x - iconSize / 2, y, iconSize, iconSize);
  ctx.strokeText(assistCountText, x - textWidth / 2, y + iconSize + textHeight + 15);
  ctx.fillText(assistCountText, x - textWidth / 2, y + iconSize + textHeight + 15);
  ctx.closePath();
};

const drawAssistBar = async (ctx, participants, x, y, width, height, radius) => {
  let px = x;
  let py = y;

  ctx.font = "40px Roboto";
  ctx.fillStyle = "#EEEEEE";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  const text = "Damage";
  const pw = ctx.measureText(text).width;
  const textX = px + width / 2 - pw / 2;
  ctx.strokeText(text, textX, py);
  ctx.fillText(text, textX, py);

  px = x;
  py += 25;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(px + radius, py);
  ctx.lineTo(px + width - radius, py);
  ctx.quadraticCurveTo(px + width, py, px + width, py + radius);
  ctx.lineTo(px + width, py + height - radius);
  ctx.quadraticCurveTo(px + width, py + height, px + width - radius, py + height);
  ctx.lineTo(px + radius, py + height);
  ctx.quadraticCurveTo(px, py + height, px, py + height - radius);
  ctx.lineTo(px, py + radius);
  ctx.quadraticCurveTo(px, py, px + radius, py);
  ctx.closePath();

  ctx.fillStyle = ctx.createPattern(await loadImage(path.join(assetsPath, "assistBarBg.png")), "repeat");
  ctx.fill();

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 15;
  ctx.stroke();
  ctx.clip();

  const COLORS = ["#730b0b", "#7e3400", "#835400", "#817306", "#79902c", "#6aad56", "#4fc987", "#00e3bf"];

  const totalDamage = participants.reduce((sum, participant) => {
    return sum + Math.max(1, participant.DamageDone);
  }, 0);
  participants.forEach((participant) => {
    const damagePercent = (Math.max(1, participant.DamageDone) / totalDamage) * 100;
    participant.damagePercent = damagePercent;
  });

  // Draw bars
  participants.forEach((participant, i) => {
    const color = COLORS[i % COLORS.length];
    const barWidth = Math.round((participant.damagePercent / 100) * width);
    ctx.beginPath();
    ctx.rect(px, py, barWidth, height);
    ctx.fillStyle = color;
    ctx.fill();

    if (barWidth > 60) {
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.font = "32px Roboto";
      const text = participant.DamageDone === 0 ? "0%" : Math.round(participant.damagePercent) + "%";
      const pw = ctx.measureText(text).width;
      const textX = px + barWidth / 2 - pw / 2;
      const textY = py + height / 2 + 10;
      ctx.strokeText(text, textX, textY);
      ctx.fillText(text, textX, textY);
    }

    ctx.closePath();
    px += barWidth;
  });

  // Draw gradient over the bar
  const barGradient = ctx.createLinearGradient(x + width / 2, py, x + width / 2, py + height);
  barGradient.addColorStop(0, "rgba(200, 200, 200, 0.5)");
  barGradient.addColorStop(0.15, "rgba(200, 200, 200, 0.25)");
  barGradient.addColorStop(0.5, "rgba(100, 100, 100, 0.15)");
  barGradient.addColorStop(0.85, "rgba(100, 100, 100, 0.1)");
  barGradient.addColorStop(1, "rgba(0, 0, 0, 0.25)");

  ctx.beginPath();
  ctx.rect(x, py, width, height);
  ctx.fillStyle = barGradient;
  ctx.fill();
  ctx.closePath();

  ctx.restore();

  // Draw caption
  px = x;
  py += height + 20;
  participants.forEach((participant, i) => {
    const color = COLORS[i % COLORS.length];
    const text = `${participant.Name} [${Math.round(participant.AverageItemPower)}]`;

    ctx.beginPath();
    ctx.font = "30px Roboto";
    const pw = ctx.measureText(text).width;

    if (px + 50 + 15 + pw + 25 > width) {
      px = x;
      py += 50;
    }
    ctx.rect(px, py, 50, 50);

    ctx.fillStyle = color;
    ctx.fill();

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 5;
    ctx.stroke();

    px += 50 + 15;

    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 5;
    ctx.strokeText(text, px, py + 34);
    ctx.fillText(text, px, py + 34);
    px += pw;

    px += 25;
  });

  return height + py;
};

async function generateEventImage(event, { showAttunement = true, splitLootValue = false } = {}) {
  return memoize(
    `eventImage-${event.EventId}`,
    async () => {
      showAttunement = showAttunement && hasAwakening(event);

      let canvas = createCanvas(1600, showAttunement ? 1550 : 1250);
      const w = canvas.width;
      const ctx = canvas.getContext("2d");

      await drawImage(ctx, path.join(assetsPath, "background.png"), -1, -1, 1602, 1554);
      await drawPlayer(ctx, event.Killer, 15, 0, { showAttunement });
      await drawPlayer(ctx, event.Victim, 935, 0, { showAttunement });
      await drawTimestamp(ctx, event, w / 2, 50);
      const assistCount = Math.max(event.GroupMembers.length, event.Participants.length);
      if (assistCount > 1) await drawAssistCount(ctx, assistCount, w / 2, 290, { iconSize: 80 });
      await drawFame(ctx, event, w / 2, 470);
      if (event.lootValue) await drawLootValue(ctx, event.lootValue, w / 2, 675, { splitLootValue });
      await drawAssistBar(ctx, event.Participants, 35, showAttunement ? 1350 : 1050, 1530, 80, 40);

      const buffer = await optimizeImage(canvas.toBuffer(), 580);
      canvas = null;

      if (buffer.length > 2 * 1048576) {
        logger.warn(`Event image bigger than usual. Size: ${fileSizeFormatter(buffer.length)}`);
      }
      return buffer;
    },
    {
      timeout: 60 * SECOND,
    },
  );
}

async function generateInventoryImage(event, { lootValue, splitLootValue = false } = {}) {
  return memoize(
    `eventVictimInventoryImage-${event.EventId}`,
    async () => {
      const inventory = event.Victim.Inventory.filter((i) => i != null);
      const hasInventoryLootValue = lootValue && splitLootValue && lootValue.inventory;

      const BLOCK_SIZE = 130;
      const WIDTH = 1600;
      const PADDING = 20;

      let x = PADDING;
      let y = PADDING;
      const itemsPerRow = Math.floor((WIDTH - PADDING * 2) / BLOCK_SIZE);
      const rows = Math.ceil(inventory.length / itemsPerRow);

      let canvas = createCanvas(WIDTH, rows * BLOCK_SIZE + PADDING * 2 + (hasInventoryLootValue ? 35 : 0));
      const w = canvas.width;
      const ctx = canvas.getContext("2d");

      await drawImage(ctx, path.join(assetsPath, "/background.png"), 0, 0);

      for (const item of inventory) {
        if (!item) continue;

        if (x + BLOCK_SIZE > WIDTH - PADDING) {
          x = PADDING;
          y += BLOCK_SIZE;
        }
        await drawItem(ctx, item, x, y, { size: BLOCK_SIZE });
        x += BLOCK_SIZE;
      }

      if (hasInventoryLootValue) {
        y += BLOCK_SIZE;

        ctx.beginPath();
        ctx.font = "36px Roboto";
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 4;
        const lootValueText = digitsFormatter(lootValue.inventory);
        const lootValueTextWidth = ctx.measureText(lootValueText).width;
        const lootValueLineHeight = ctx.measureText("M").width;
        const lootValueIconSize = 45;

        await drawImage(
          ctx,
          path.join(assetsPath, "lootValue.png"),
          w - PADDING * 2 - lootValueIconSize - PADDING * 0.5 - lootValueTextWidth,
          y,
          lootValueIconSize,
          lootValueIconSize,
        );

        ctx.strokeText(lootValueText, w - PADDING * 2 - lootValueTextWidth, y + lootValueLineHeight * 1.1);
        ctx.fillText(lootValueText, w - PADDING * 2 - lootValueTextWidth, y + lootValueLineHeight * 1.1);
      }

      const buffer = await optimizeImage(canvas.toBuffer(), 900);
      canvas = null;

      if (buffer.length > 1048576) {
        logger.warn(`Event image bigger than usual. Size: ${fileSizeFormatter(buffer.length)}`);
      }
      return buffer;
    },
    {
      timeout: 60 * SECOND,
    },
  );
}

module.exports = {
  generateEventImage,
  generateInventoryImage,
};
