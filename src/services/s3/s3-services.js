const AWS = require('@aws-sdk/client-sts');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config/config');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');
// const db = require('./db'); // Assuming you have a database module

let cachedCredentials = null;
let credentialsExpiry = null;

const accountId = config.aws.accountId;
// const accessKeyId = config.aws.accessKeyId;
// const secretAccessKey = config.aws.secretAccessKey;
const region = config.aws.region;
const bucket = config.aws.bucket;

const assumeRoleWithPolicy = async (userId, isAdmin) => {
  if (cachedCredentials && credentialsExpiry && new Date() < credentialsExpiry) {
    return cachedCredentials;
  }

  let policy;

  if (isAdmin) {
    // Admin policy allowing full access to S3 bucket
    policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['s3:ListBucket'],
          Resource: `arn:aws:s3:::${bucket}`,
        },
        {
          Effect: 'Allow',
          Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
          Resource: `arn:aws:s3:::${bucket}/*`,
        },
      ],
    });
  } else {
    // Regular user policy restricting access to specific prefixes
    policy = JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['s3:ListBucket'],
          Resource: `arn:aws:s3:::${bucket}`,
          Condition: {
            StringLike: {
              's3:prefix': [`private/${userId}/*`, `public/*`],
            },
          },
        },
        {
          Effect: 'Allow',
          Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
          Resource: [`arn:aws:s3:::${bucket}/private/${userId}/*`, `arn:aws:s3:::${bucket}/public/*`],
        },
      ],
    });
  }

  const params = {
    RoleArn: `arn:aws:iam::${accountId}:role/private-s3-access-role`,
    RoleSessionName: 'session1',
    Policy: policy,
    DurationSeconds: 3600,
  };

  const stsClient = new AWS.STSClient();

  const data = await stsClient.send(new AWS.AssumeRoleCommand(params));
  cachedCredentials = {
    accessKeyId: data.Credentials.AccessKeyId,
    secretAccessKey: data.Credentials.SecretAccessKey,
    sessionToken: data.Credentials.SessionToken,
  };
  credentialsExpiry = new Date();
  credentialsExpiry.setSeconds(credentialsExpiry.getSeconds() + data.Credentials.Expiration);

  return cachedCredentials;
};

const uploadPrivateImage = async (file, userId, isAdmin) => {
  const credentials = await assumeRoleWithPolicy(userId, isAdmin);
  const s3Client = new S3Client({
    region: region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  const fileContent = fs.readFileSync(file.path);
  const s3Key = `private/${userId}/${uuidv4()}_${file.originalname}`;
  const params = {
    Bucket: bucket,
    Key: s3Key,
    Body: fileContent,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(params));

  return s3Key;
};

const getImageUrl = async (userId, s3Key, isAdmin) => {
  const credentials = await assumeRoleWithPolicy(userId, isAdmin);

  // Configure S3Client with temporary credentials
  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionxToken,
    },
  });

  const params = {
    Bucket: bucket,
    Key: s3Key,
  };

  try {
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    // Read the stream data
    const streamToBuffer = (stream) => {
      return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
      });
    };

    const imageBuffer = await streamToBuffer(response.Body);
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    return imageUrl;
  } catch (err) {
    throw new ApiError(err?.statusCode || httpStatus.NOT_FOUND, err.message || 'Image not found');
    // console.error('Error fetching object:', err);
  }
};

// const getImageUrl = async (userId, s3Key, isAdmin) => {
//   const credentials = await assumeRoleWithPolicy(userId, isAdmin);
//   const s3Client = new S3Client({
//     region: region,
//     credentials: {
//       accessKeyId: credentials.accessKeyId,
//       secretAccessKey: credentials.secretAccessKey,
//       sessionToken: credentials.sessionToken,
//     },
//   });

//   const params = {
//     Bucket: bucket,
//     Key: s3Key,
//     Expires: 60,
//   };

//   const command = new GetObjectCommand(params);
//   const { Body } = await s3Client.send(command);

//   // Construct URL manually

//   const url = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
//   return url;
// };

module.exports = {
  uploadPrivateImage,
  getImageUrl,
};
