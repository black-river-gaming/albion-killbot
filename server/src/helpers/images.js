const sharp = require("sharp");

const optimizeImage = async (buffer, w = 640) => {
  return await sharp(buffer).resize(w, null).png().toBuffer();
};

module.exports = {
  optimizeImage,
};
