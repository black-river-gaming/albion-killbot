const os = require("os");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const moment = require("moment");
const { createCanvas, registerFont, loadImage } = require("canvas");
const logger = require("./logger")("images");
const { sleep, digitsFormatter, fileSizeFormatter } = require("./utils");

registerFont(path.join(__dirname, "assets", "fonts", "Roboto-Regular.ttf"), {
  family: "Roboto",
  weight: "Normal",
});

const CDNS = [
  {
    url: "https://render.albiononline.com/v1/item/{type}.png?quality={quality}",
    qualitySupport: true,
    trash: true,
  },
  {
    url: "https://gameinfo.albiononline.com/api/gameinfo/items/{type}",
    qualitySupport: true,
    trash: true,
  },
];

const TMPDIR = path.join(os.tmpdir(), "albion-killbot-cache");
// Ensure this exists
if (!fs.existsSync(TMPDIR)) {
  fs.mkdirSync(TMPDIR);
}

const IMAGE_MIME = "image/png";
const IMAGE_OPTIONS = {
  compressionLevel: 7,
};

let S3;
if (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY) {
  const AWS = require("aws-sdk");
  S3 = new AWS.S3({
    apiVersion: "2006-03-01",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION || "us-east-1",
    maxRetries: 3,
    httpOptions: {
      timeout: 60000,
    },
  });
}

const drawImage = async (ctx, src, x, y, sw, sh) => {
  if (!src) return;
  let img;
  try {
    img = await loadImage(src);
  } catch (e) {
    logger.error(`[images] Error loading image: ${src} (${e})`);
    img = await loadImage("./assets/notfound.png");
  }
  if (sw && sh) ctx.drawImage(img, x, y, sw, sh);
  else ctx.drawImage(img, x, y);
};

const locks = {};
const missings = {};
// Download items from CDN, cache them and return path to cached image
const getItemFile = async (item, tries = 0) => {
  // If we already tried 2 times and failed, try without parameters (and don't save to s3)
  const forceResult = tries > 3;
  const itemFileName = `${item.Type}_Q${item.Quality}`;
  const itemFile = path.join(TMPDIR, itemFileName);
  if (forceResult) missings[itemFile] = true;
  if (missings[itemFile]) return null;
  if (fs.existsSync(itemFile)) {
    const stat = fs.statSync(itemFile);
    if (stat.size > 0) return itemFile;
  }

  // Lock the file while the Write Stream is open
  if (locks[itemFile]) {
    logger.warn(`${itemFile} is locked. Trying again...`);
    await sleep(10000);
    return getItemFile(item, tries);
  }
  locks[itemFile] = true;
  const writer = fs.createWriteStream(itemFile);
  writer.on("finish", () => {
    locks[itemFile] = false;
  });
  // Check if file is available on S3 bucket
  if (S3) {
    try {
      const data = await S3.getObject({
        Bucket: process.env.AWS_BUCKET || "albion-killbot",
        Key: itemFileName,
      }).promise();
      return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(itemFile));
        writer.on("error", e => reject(e));
        writer.end(data.Body);
      });
    } catch (e) {
      logger.error(`[images] Unable to download file from S3 (${e})`);
    }
  }
  logger.debug(`[images] Downloading new file from CDNs: ${itemFileName}`);
  for (let cdn of CDNS) {
    // If the CDN does not support quality and item has Quality, skip this cdn
    if (!cdn.qualitySupport && item.Quality > 0) continue;
    // If trash item is outdated, skip
    if (!cdn.trash && item.Type.includes("_TRASH")) continue;

    const url = cdn.url.replace("{type}", item.Type).replace("{quality}", item.Quality);
    const params = {};
    if (!forceResult) {
      params.quality = item.Quality;
    }
    try {
      const response = await axios.get(url, {
        params,
        timeout: 30000,
        responseType: "stream",
      });
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          // If S3 is set, upload to bucket before returning
          if (S3 && !forceResult) {
            logger.debug(`[images] Uploading new file to S3: ${itemFileName}`);
            try {
              S3.putObject({
                Body: fs.createReadStream(itemFile),
                Bucket: process.env.AWS_BUCKET || "albion-killbot",
                Key: itemFileName,
              }).promise();
            } catch (e) {
              logger.error(`[images] Unable to upload file to S3 (${e})`);
            }
          }

          resolve(itemFile);
        });
        writer.on("error", e => reject(e));
      });
    } catch (e) {
      logger.error(`[images] Unable to download ${url} (${e})`);
      locks[itemFile] = false;
    }
  }
  await sleep(5000);
  return getItemFile(item, tries + 1);
};

const drawItem = async (ctx, item, x, y, block_size = 217) => {
  if (!item) return await drawImage(ctx, "./assets/slot.png", x, y, block_size, block_size);
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

exports.generateEventImage = async event => {
  let canvas = createCanvas(1600, 1250);
  let tw, th;
  const w = canvas.width;
  const ctx = canvas.getContext("2d");

  await drawImage(ctx, "./assets/background.png", 0, 0);

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
    await drawItem(ctx, equipment.Potion, x + BLOCK_SIZE * 2, y + BLOCK_SIZE * 2);
    await drawItem(ctx, equipment.Food, x, y + BLOCK_SIZE * 2);
  };
  await drawPlayer(event.Killer, 15, 0);
  await drawPlayer(event.Victim, 935, 0);

  // timestamp
  ctx.beginPath();
  ctx.font = "35px Roboto";
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  const timestamp = moment.utc(event.TimeStamp).format("YYYY.MM.DD HH:mm");
  tw = ctx.measureText(timestamp).width;
  th = ctx.measureText("M").width;
  ctx.strokeText(timestamp, w / 2 - tw / 2, th * 4);
  ctx.fillText(timestamp, w/ 2 - tw / 2, th * 4);

  // fame
  ctx.beginPath();
  ctx.font = "40px Roboto";
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  const fame = digitsFormatter(event.TotalVictimKillFame);
  tw = ctx.measureText(fame).width;
  const IMG_SIZE = 100;
  await drawImage(ctx, "./assets/fame.png", w / 2 - IMG_SIZE / 2, 500 - IMG_SIZE / 2);
  ctx.strokeText(fame, w / 2 - tw / 2, 600);
  ctx.fillText(fame, w / 2 - tw / 2, 600);

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
    participants.forEach(participant => {
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

  const buffer = canvas.toBuffer(IMAGE_MIME, IMAGE_OPTIONS);
  if (buffer.length > 2 * 1048576) {
    logger.warn(`Event image bigger than usual. Size: ${fileSizeFormatter(buffer.length)}`);
  }
  // TODO: Optimize image size
  canvas = null;
  return buffer;
};

exports.generateInventoryImage = async event => {
  const BLOCK_SIZE = 130;
  const WIDTH = 1600;
  const PADDING = 20;
  const inventory = event.Victim.Inventory.filter(item => item != null);

  let x = PADDING;
  let y = PADDING;
  const itemsPerRow = Math.floor((WIDTH - PADDING * 2) / BLOCK_SIZE);
  const rows = Math.ceil(inventory.length / itemsPerRow);

  let canvas = createCanvas(WIDTH, rows * BLOCK_SIZE + PADDING * 2);
  const ctx = canvas.getContext("2d");

  await drawImage(ctx, "./assets/background.png", 0, 0);

  for (let item of inventory) {
    if (!item) continue;

    if (x + BLOCK_SIZE > WIDTH - PADDING) {
      x = PADDING;
      y += BLOCK_SIZE;
    }
    await drawItem(ctx, item, x, y, BLOCK_SIZE);
    x += BLOCK_SIZE;
  }

  const buffer = canvas.toBuffer(IMAGE_MIME, IMAGE_OPTIONS);
  if (buffer.length > 1048576) {
    logger.warn(`Inventory image bigger than usual. Size: ${fileSizeFormatter(buffer.length)}`);
  }
  // TODO: Optimize image size
  canvas = null;
  return buffer;
};
