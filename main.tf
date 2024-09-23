provider "aws" {
  region = "us-west-2"
}

# S3 Buckets
resource "aws_s3_bucket" "bucket1" {
  bucket = "my-bucket-1"
  acl    = "private"
}

resource "aws_s3_bucket" "bucket2" {
  bucket = "my-bucket-2"
  acl    = "private"
}

# EC2 Instances
resource "aws_instance" "instance1" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}

resource "aws_instance" "instance2" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
}
