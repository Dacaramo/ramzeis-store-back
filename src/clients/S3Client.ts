import { S3Client as S3C } from '@aws-sdk/client-s3';

const S3Client = new S3C({
  region: 'us-east-1',
});

export default S3Client;
