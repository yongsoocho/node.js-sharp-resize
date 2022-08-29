const AWS = require("aws-sdk");
const Sharp = require("sharp");

const S3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = event.Records[0].s3.object.key;
  const filename = Key.split("/")[Key.split("/").length - 1];
  const filestring = Key.split("/")[Key.split("/").length - 1].split(".")[0];
  const ext = Key.split(".")[Key.split(".").length - 1];
  const requiredFormat = ext === "jpg" ? "jpeg" : ext;

  try {
    const s3Object = await S3.getObject({ Bucket, Key }).promise();

    const resizedImage = await Sharp(s3Object.Body)
      .resize({ width: 500, height: 600, fit: "inside" })
      .webp({
        quality: 100,
        nearLossless: true,
        lossless: true,
        effort: 0,
      })
      .toBuffer();

    await S3.putObject({
      Bucket,
      Key: `posts/${filestring}.webp`,
      Body: resizedImage,
    }).promise();

    return callback(null, `posts/${filestring}.webp`);
  } catch (err) {
    callback(`Error resizing files: ${err}`);
  }
};
