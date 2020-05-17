const os = require("os");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { createCanvas, registerFont, loadImage } = require("canvas");
const logger = require("./logger");
const { sleep, digitsFormatter, fileSizeFormatter } = require("./utils");

registerFont(path.join(__dirname, "assets", "fonts", "Roboto-Regular.ttf"), {
  family: "Roboto",
  weight: "Normal"
});

const CDNS = [
  {
    url:
      "https://albiononline2d.ams3.cdn.digitaloceanspaces.com/thumbnails/orig/{type}",
    qualitySupport: false,
    trash: false
  },
  {
    url: "http://www.albiononline.site/img/albion/{type}-{quality}.png",
    qualitySupport: true,
    trash: false
  },
  {
    url: "https://gameinfo.albiononline.com/api/gameinfo/items/{type}",
    qualitySupport: true,
    trash: true
  }
];

const TMPDIR = path.join(os.tmpdir(), "albion-killbot-cache");
// Ensure this exists
if (!fs.existsSync(TMPDIR)) {
  fs.mkdirSync(TMPDIR);
}

const IMAGE_MIME = "image/png";
const IMAGE_OPTIONS = {
  compressionLevel: 7
};

const drawImage = async (ctx, src, x, y, sw, sh) => {
  if (!src) return;
  let img;
  try {
    img = await loadImage(src);
  } catch (e) {
    logger.error(`Error loading image: ${src} (${e})`);
    img = await loadImage("./assets/notfound.png");
  }
  if (sw && sh) ctx.drawImage(img, x, y, sw, sh);
  else ctx.drawImage(img, x, y);
};

// Download items from CDN, cache them and return path to cached image
const getItemFile = async item => {
  const itemFile = path.join(TMPDIR, `${item.Type}_Q${item.Quality}`);
  if (fs.existsSync(itemFile)) {
    const stat = fs.statSync(itemFile);
    if (stat.size > 0) return itemFile;
  }

  const writer = fs.createWriteStream(itemFile);
  for (let cdn of CDNS) {
    // If the CDN does not support quality and item has Quality, skip this cdn
    if (!cdn.qualitySupport && item.Quality > 0) continue;
    // If trash item is outdated, skip
    if (!cdn.trash && item.Type.includes("_TRASH")) continue;

    const url = cdn.url.replace("{type}", item.Type).replace("{quality}", item.Quality);
    try {
      const response = await axios.get(url, {
        params: {
          quality: item.Quality
        },
        responseType: "stream"
      });
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          resolve(itemFile);
        });
        writer.on("error", e => {
          reject(e);
        });
      });
    } catch (e) {
      logger.error(`Unable to download ${url} (${e})`);
    }
  }
  await sleep(5000);
  return getItemFile(item);
};

const drawItem = async (ctx, item, x, y, block_size = 217) => {
  if (!item) return;
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
  let canvas = createCanvas(1600, 1300);
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
    ctx.fillStyle = "#BBB";
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
    if (equipment.Head) {
      await drawItem(ctx, equipment.Head, x + BLOCK_SIZE, y);
    }
    if (equipment.Armor) {
      await drawItem(ctx, equipment.Armor, x + BLOCK_SIZE, y + BLOCK_SIZE);
    }
    if (equipment.MainHand) {
      await drawItem(ctx, equipment.MainHand, x, y + BLOCK_SIZE);
      // Two-handed equipment
      if (equipment.MainHand.Type.split("_")[1] == "2H") {
        ctx.globalAlpha = 0.2;
        await drawItem(
          ctx,
          equipment.MainHand,
          x + BLOCK_SIZE * 2,
          y + BLOCK_SIZE
        );
        ctx.globalAlpha = 1;
      }
    }
    if (equipment.OffHand) {
      await drawItem(
        ctx,
        equipment.OffHand,
        x + BLOCK_SIZE * 2,
        y + BLOCK_SIZE
      );
    }
    if (equipment.Shoes) {
      await drawItem(ctx, equipment.Shoes, x + BLOCK_SIZE, y + BLOCK_SIZE * 2);
    }
    if (equipment.Bag) {
      await drawItem(ctx, equipment.Bag, x, y);
    }
    if (equipment.Cape) {
      await drawItem(ctx, equipment.Cape, x + BLOCK_SIZE * 2, y);
    }
    if (equipment.Mount) {
      await drawItem(ctx, equipment.Mount, x + BLOCK_SIZE, y + BLOCK_SIZE * 3);
    }
    if (equipment.Potion) {
      await drawItem(ctx, equipment.Potion, x + BLOCK_SIZE * 2, y + BLOCK_SIZE * 2);
    }
    if (equipment.Food) {
      await drawItem(
        ctx,
        equipment.Food,
        x,
        y + BLOCK_SIZE * 2
      );
    }
  };
  await drawPlayer(event.Killer, 15, 0);
  await drawPlayer(event.Victim, 935, 0);

  // fame
  ctx.beginPath();
  ctx.font = "40px Roboto";
  ctx.fillStyle = "#FFF";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 4;
  const fame = digitsFormatter(event.TotalVictimKillFame);
  let tw = ctx.measureText(fame).width;
  const IMG_SIZE = 100;
  await drawImage(
    ctx,
    "./assets/fame.png",
    w / 2 - IMG_SIZE / 2,
    500 - IMG_SIZE / 2
  );
  ctx.strokeText(fame, w / 2 - tw / 2, 600);
  ctx.fillText(fame, w / 2 - tw / 2, 600);

  // assists bar
  const drawAssistBar = (participants, x, y, width, height, radius) => {
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fillStyle = "white";
    ctx.fill();

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 20;
    ctx.stroke();
    ctx.clip();

    const COLORS = [
      "#730b0b",
      "#7e3400",
      "#835400",
      "#817306",
      "#79902c",
      "#6aad56",
      "#4fc987",
      "#00e3bf"
    ];

    const totalDamage = participants.reduce((sum, participant) => {
      return sum + participant.DamageDone;
    }, 0);
    participants.forEach(participant => {
      const damagePercent = Math.round(
        (participant.DamageDone / totalDamage) * 100
      );
      participant.damagePercent = damagePercent;
    });

    // Draw bars
    let px = x;
    participants.forEach((participant, i) => {
      const color = COLORS[i % COLORS.length];
      const barWidth = Math.round((participant.damagePercent / 100) * width);
      ctx.beginPath();
      ctx.rect(px, y, barWidth, height);
      ctx.fillStyle = color;
      ctx.strokeStyle = "black";
      ctx.fill();
      px += barWidth;
    });

    ctx.restore();

    // Draw caption
    px = x;
    let py = y + height + 25;
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

  drawAssistBar(event.Participants, 35, 1090, 1530, 100, 25);

  const buffer = canvas.toBuffer(IMAGE_MIME, IMAGE_OPTIONS);
  logger.debug(
    `Created event image. Size: ${fileSizeFormatter(buffer.length)}`
  );
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
  logger.debug(
    `Created inventory image. Size: ${fileSizeFormatter(buffer.length)}`
  );
  // TODO: Optimize image size
  canvas = null;
  return buffer;
};
