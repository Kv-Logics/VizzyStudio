import aioboto3
import logging
from botocore.exceptions import ClientError
from app.config import settings

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.session = aioboto3.Session(
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_DEFAULT_REGION
        )
        self.bucket_name = settings.S3_BUCKET_NAME

    async def upload_file_bytes(self, file_bytes: bytes, object_name: str, content_type: str = "image/png") -> str:
        """
        Uploads bytes to S3 and returns the public URL.
        """
        try:
            async with self.session.client("s3") as s3_client:
                await s3_client.put_object(
                    Bucket=self.bucket_name,
                    Key=object_name,
                    Body=file_bytes,
                    ContentType=content_type,
                    # Note: You may need to configure bucket ACLs for public-read, 
                    # or use CloudFront/presigned URLs in production.
                    # ACL="public-read"
                )
                
                # Construct the public URL (assuming bucket is public or public access is configured)
                url = f"https://{self.bucket_name}.s3.{settings.AWS_DEFAULT_REGION}.amazonaws.com/{object_name}"
                return url
        except ClientError as e:
            logger.error(f"Failed to upload to S3: {e}")
            raise e

s3_service = S3Service()
