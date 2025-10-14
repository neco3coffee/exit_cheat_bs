require 'aws-sdk-s3'

Aws.config.update({
  region: ENV.fetch('AWS_REGION', 'ap-northeast-1'),
  credentials: Aws::Credentials.new(
    ENV.fetch('AWS_ACCESS_KEY_ID', ''),
    ENV.fetch('AWS_SECRET_ACCESS_KEY', '')
  ),
  endpoint: ENV['AWS_ENDPOINT'],
  force_path_style: ENV['AWS_FORCE_PATH_STYLE'] == 'true',
})
