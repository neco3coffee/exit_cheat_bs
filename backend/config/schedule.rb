set :environment, ENV.fetch("RAILS_ENV", "development")
set :output, { error: "log/cron_error.log", standard: "log/cron.log" }
set :job_template, "bash -lc ':job'"

env :PATH, ENV["PATH"]
env :GEM_HOME, ENV["GEM_HOME"] if ENV["GEM_HOME"]
env :GEM_PATH, ENV["GEM_PATH"] if ENV["GEM_PATH"]

%w[
  POSTGRES_USER
  POSTGRES_PASSWORD
  POSTGRES_DB
  DB_HOST
  BRAWL_STARS_API_TOKEN1
  SECRET_KEY_BASE
  http_proxy
  https_proxy
  no_proxy
].each do |key|
  value = ENV[key]
  env key, value if value && !value.empty?
end

every 30.minutes do
  runner "BattleAutoSaveEnqueueJob.perform_now"
end
