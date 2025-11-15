FROM ruby:3.4.6

# RUN apt-get update -qq && apt-get install -y mariadb-client
RUN apt-get update -qq && apt-get install -y \
  build-essential \
  libpq-dev \
  cron

WORKDIR /app

COPY Gemfile /app/Gemfile
COPY Gemfile.lock /app/Gemfile.lock
RUN bundle install

COPY . /app/

CMD ["bash", "-c", "rm -f tmp/pids/server.pid && exec bundle exec rails s -p 3000 -b '0.0.0.0' "]
EXPOSE 3000
