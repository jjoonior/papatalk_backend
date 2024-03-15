import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';

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

  async uploadFile(Key, file): Promise<any> {
    const uploadParams: S3.Types.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const uploadResult: ManagedUpload.SendData = await this.s3
      .upload(uploadParams)
      .promise();

    return { url: uploadResult.Location, key: uploadResult.Key };
  }

  async deleteFile(Key: string): Promise<void> {
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key,
    };

    try {
      await this.s3.deleteObject(deleteParams).promise();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
