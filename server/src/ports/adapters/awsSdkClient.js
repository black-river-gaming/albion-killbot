const { S3 } = require("@aws-sdk/client-s3");
const logger = require("../../helpers/logger");

const { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, AWS_BUCKET } = process.env;

const isEnabled = !!AWS_ACCESS_KEY && !!AWS_SECRET_KEY;
const client = new S3({
  region: AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
  maxRetries: 3,
  httpOptions: {
    timeout: 60000,
  },
});

async function downloadFromS3(name, writer) {
  try {
    const response = await client.getObject({
      Bucket: AWS_BUCKET || "albion-killbot",
      Key: name,
    });

    return new Promise((resolve) => {
      logger.verbose(`Downloading "${name}" from AWS Bucket`, { name });
      response.Body.pipe(writer);
      writer.on("finish", () => resolve(true));
      writer.on("error", () => resolve(false));
      // Emergency timeout
      setTimeout(() => resolve(false), 30000);
    });
  } catch (error) {
    logger.warn(`Error while downloading ${name} from AWS Bucket: ${error.message}`, { name, error });
    return null;
  }
}

async function uploadToS3(name, readStream) {
  try {
    logger.verbose(`Uploading "${name}" to AWS Bucket`);

    await client.putObject({
      Bucket: AWS_BUCKET || "albion-killbot",
      Key: name,
      Body: readStream,
    });

    return true;
  } catch (error) {
    logger.warn(`Failed to upload ${name} from AWS Bucket: ${error.message}`, { error, name });
    return false;
  }
}

module.exports = {
  isEnabled,
  downloadFromS3,
  uploadToS3,
};
