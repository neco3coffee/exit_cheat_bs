# frozen_string_literal: true

class AddMapIdToBattles < ActiveRecord::Migration[8.0]
  require "json"

  class Battle < ApplicationRecord
    self.table_name = "battles"
    self.inheritance_column = :_type_disabled
  end

  def up
    add_column :battles, :map_id, :integer

    Battle.reset_column_information

    say_with_time "Backfilling battles.map_id from raw_data" do
      execute <<~SQL.squish
        UPDATE battles
        SET map_id = (raw_data -> 'event' ->> 'id')::integer
        WHERE (raw_data -> 'event' ->> 'id') ~ '^[0-9]+$'
      SQL

      Battle.where(map_id: nil).find_each do |battle|
        map_id = extract_map_id(battle.raw_data)
        next unless map_id

        battle.update_columns(map_id: map_id)
      end
    end
  end

  def down
    remove_column :battles, :map_id
  end

  private

  def extract_map_id(raw_data)
    payload = normalize_raw_data(raw_data)
    raw_id = payload&.dig("event", "id")

    case raw_id
    when Integer
      raw_id
    when String
      raw_id = raw_id.strip
      return raw_id.to_i if raw_id.match?(/\A\d+\z/)
    end

    nil
  end

  def normalize_raw_data(raw_data)
    case raw_data
    when Hash
      raw_data
    when String
      JSON.parse(raw_data)
    else
      nil
    end
  rescue JSON::ParserError
    nil
  end
end
