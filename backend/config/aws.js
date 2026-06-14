const { S3Client }           = require('@aws-sdk/client-s3');
const { SESClient }          = require('@aws-sdk/client-ses');
const { RekognitionClient }  = require('@aws-sdk/client-rekognition');

const region = process.env.AWS_REGION || 'us-east-1';

const credentials = {
  accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

const s3           = new S3Client({ region, credentials });
const ses          = new SESClient({ region, credentials });
const rekognition  = new RekognitionClient({ region, credentials });

module.exports = { s3, ses, rekognition, region };
