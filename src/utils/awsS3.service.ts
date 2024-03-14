import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import * as crypto from 'crypto';

@Injectable()
export class AwsS3Service {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file): Promise<any> {
    const uploadParams: S3.Types.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: crypto.randomUUID(),
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const uploadResult: ManagedUpload.SendData = await this.s3
      .upload(uploadParams)
      .promise();

    return { url: uploadResult.Location, key: uploadResult.Key };
  }
}
