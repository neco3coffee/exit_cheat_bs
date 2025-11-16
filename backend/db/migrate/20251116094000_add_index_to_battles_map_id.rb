# frozen_string_literal: true

class AddIndexToBattlesMapId < ActiveRecord::Migration[8.0]
  def change
    add_index :battles, :map_id
  end
end
