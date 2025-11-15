require 'rails_helper'

RSpec.describe BattleAutoSaveEnqueueJob, type: :job do
  include ActiveJob::TestHelper
  include ActiveSupport::Testing::TimeHelpers

  around do |example|
    original_adapter = ActiveJob::Base.queue_adapter
    ActiveJob::Base.queue_adapter = :test
    clear_enqueued_jobs
    clear_performed_jobs
    example.run
    clear_enqueued_jobs
    clear_performed_jobs
    ActiveJob::Base.queue_adapter = original_adapter
  end

  it 'enqueues BattleAutoSaveJob for each eligible player' do
  travel_to Time.zone.parse('2025-11-15 12:00:00 UTC') do
      eligible_player = create(:player, auto_save_enabled: true, auto_save_expires_at: 2.hours.from_now)
      create(:player, auto_save_enabled: false, auto_save_expires_at: 2.hours.from_now)
      create(:player, auto_save_enabled: true, auto_save_expires_at: 1.hour.ago)

      expect do
        described_class.perform_now
      end.to have_enqueued_job(BattleAutoSaveJob).with(eligible_player.id).exactly(:once)

      expect(enqueued_jobs.size).to eq(1)
    end
  end

  it 'handles players without expiration by enqueuing them' do
    player_without_expiration = create(:player, auto_save_enabled: true, auto_save_expires_at: nil)

    expect do
      described_class.perform_now
    end.to have_enqueued_job(BattleAutoSaveJob).with(player_without_expiration.id)
  end

  it 'processes players in batches without raising errors' do
    players = create_list(:player, BattleAutoSaveEnqueueJob::BATCH_SIZE + 5,
                          auto_save_enabled: true,
                          auto_save_expires_at: 1.hour.from_now)

    expect do
      described_class.perform_now
    end.to have_enqueued_job(BattleAutoSaveJob).exactly(players.size).times
  end
end
