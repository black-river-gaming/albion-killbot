const AWS = require("aws-sdk");
const logger = require("../helpers/logger");

const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, AWS_BUCKET } = process.env;

const S3 = new AWS.S3({
  apiVersion: "2006-03-01",
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION || "us-east-1",
  maxRetries: 3,
  httpOptions: {
    timeout: 60000,
  },
});

function isEnabled() {
  return AWS_ACCESS_KEY && AWS_ACCESS_KEY;
}

async function getS3Object(name) {
  return await S3.getObject({
    Bucket: AWS_BUCKET || "albion-killbot",
    Key: name,
  }).promise();
}

async function downloadFromS3(name, writeStream) {
  try {
    logger.verbose(`Downloading "${name}" from AWS Bucket`);

    const data = await getS3Object(name);
    return new Promise((resolve) => {
      writeStream.on("finish", () => resolve(true));
      writeStream.on("error", () => resolve(false));
      writeStream.end(data.Body);
    });
  } catch (e) {
    logger.error(`Error while downloading ${name} from AWS Bucket:`, e);
  }
}

async function uploadToS3(name, readStream) {
  try {
    logger.verbose(`Uploading "${name}" to AWS Bucket`);

    await S3.putObject({
      Bucket: AWS_BUCKET || "albion-killbot",
      Key: name,
      Body: readStream,
    }).promise();

    return true;
  } catch (e) {
    logger.error(`Failed to upload ${name} from AWS Bucket:`, e);

    return false;
  }
}

module.exports = {
  downloadFromS3,
  getS3Object,
  isEnabled,
  uploadToS3,
};
