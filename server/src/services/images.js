const moment = require("moment");
const path = require("node:path");
const { createCanvas, registerFont, loadImage } = require("canvas");
const { getItemFile } = require("../ports/albion");

const { optimizeImage } = require("../helpers/images");
const { digitsFormatter, fileSizeFormatter } = require("../helpers/utils");
const logger = require("../helpers/logger");

const assetsPath = path.join(__dirname, "..", "assets");

registerFont(path.join(assetsPath, "fonts", "Roboto-Regular.ttf"), {
  family: "Roboto",
  weight: "Normal",
});

/* eslint-disable prefer-const */
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

const drawItem = async (ctx, item, x, y, block_size = 217) => {
  if (!item) return await drawImage(ctx, path.join(assetsPath, "slot.png"), x, y, block_size, block_size);
  const itemImage = await getItemFile(item);
  await drawImage(ctx, itemImage, x, y, block_size, block_size);

  ctx.save();
  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = Math.round(block_size / 40);
  ctx.font = `${Math.round(block_size / 7.5)}px Roboto`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeText(item.Count, x + block_size * 0.76, y + block_size * 0.73);
  ctx.fillText(item.Count, x + block_size * 0.76, y + block_size * 0.73);
  ctx.restore();
};

async function generateEventImage(event, { lootValue, splitLootValue = false } = {}) {
  let canvas = createCanvas(1600, 1250);
  let tw, th;
  const w = canvas.width;
  const ctx = canvas.getContext("2d");

  await drawImage(ctx, path.join(assetsPath, "background.png"), 0, 0);

  const drawPlayer = async (player, x, y) => {
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
    await drawItem(ctx, equipment.MainHand, x, y + BLOCK_SIZE);
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
  };
  await drawPlayer(event.Killer, 15, 0);
  await drawPlayer(event.Victim, 935, 0);

  // timestamp
  const timestampY = 50;
  const timestampIconSize = 75;
  ctx.beginPath();
  ctx.font = "35px Roboto";
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  const timestamp = moment.utc(event.TimeStamp).format("YYYY.MM.DD HH:mm");
  tw = ctx.measureText(timestamp).width;
  th = ctx.measureText("M").width;
  await drawImage(
    ctx,
    path.join(assetsPath, "time.png"),
    w / 2 - timestampIconSize / 2,
    timestampY,
    timestampIconSize,
    timestampIconSize,
  );
  ctx.strokeText(timestamp, w / 2 - tw / 2, timestampY + timestampIconSize + th + 15);
  ctx.fillText(timestamp, w / 2 - tw / 2, timestampY + timestampIconSize + th + 15);

  // fame
  const fameY = 475;
  const fameIconSize = 100;
  ctx.beginPath();
  ctx.font = "40px Roboto";
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  const fame = digitsFormatter(event.TotalVictimKillFame);
  tw = ctx.measureText(fame).width;
  await drawImage(ctx, path.join(assetsPath, "fame.png"), w / 2 - fameIconSize / 2, fameY, fameIconSize, fameIconSize);
  ctx.strokeText(fame, w / 2 - tw / 2, fameY + fameIconSize + th + 15);
  ctx.fillText(fame, w / 2 - tw / 2, fameY + fameIconSize + th + 15);

  // loot value
  if (lootValue) {
    const lootSum = splitLootValue ? lootValue.equipment : lootValue.equipment + lootValue.inventory;
    if (lootSum) {
      const lootValueY = 675;
      const lootValueIconSize = 100;
      ctx.beginPath();
      ctx.font = "40px Roboto";
      ctx.fillStyle = "#FFF";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 4;
      const lootValueText = digitsFormatter(lootSum);
      tw = ctx.measureText(lootValueText).width;
      await drawImage(
        ctx,
        path.join(assetsPath, "lootValue.png"),
        w / 2 - lootValueIconSize / 2,
        lootValueY,
        lootValueIconSize,
        lootValueIconSize,
      );
      ctx.strokeText(lootValueText, w / 2 - tw / 2, lootValueY + lootValueIconSize + th + 15);
      ctx.fillText(lootValueText, w / 2 - tw / 2, lootValueY + lootValueIconSize + th + 15);
    }
  }

  // assists bar
  const drawAssistBar = (participants, x, y, width, height, radius) => {
    let px = x;
    let py = y;

    ctx.font = "40px Roboto";
    ctx.fillStyle = "#AAAAAA";
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

    ctx.fillStyle = "white";
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

      px += barWidth;
    });

    ctx.restore();

    // Draw caption
    px = x;
    py += height + 20;
    participants.forEach((participant, i) => {
      const color = COLORS[i % COLORS.length];
      const text = `${participant.Name} [IP: ${Math.round(participant.AverageItemPower)}]`;

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

  drawAssistBar(event.Participants, 35, 1050, 1530, 80, 40);

  const buffer = await optimizeImage(canvas.toBuffer(), 580);
  canvas = null;

  if (buffer.length > 2 * 1048576) {
    logger.warn(`Event image bigger than usual. Size: ${fileSizeFormatter(buffer.length)}`);
  }
  return buffer;
}

async function generateInventoryImage(inventory, { lootValue, splitLootValue = false } = {}) {
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
    await drawItem(ctx, item, x, y, BLOCK_SIZE);
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
}
/* eslint-enable prefer-const */

module.exports = {
  generateEventImage,
  generateInventoryImage,
};
