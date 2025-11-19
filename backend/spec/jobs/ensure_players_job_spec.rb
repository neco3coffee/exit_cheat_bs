require "rails_helper"

RSpec.describe EnsurePlayersJob, type: :job do
  before do
    clear_enqueued_jobs
  end

  it "enqueues SavePlayerJob for tags missing from the database" do
    create(:player, tag: "#EXISTING")

    expect do
      described_class.perform_now([ "#existing", "ally1", "#MISSING", nil ])
    end.to have_enqueued_job(SavePlayerJob).with("#ALLY1")
      .and have_enqueued_job(SavePlayerJob).with("#MISSING")
  end

  it "does nothing when all tags already exist" do
    create(:player, tag: "#EXISTING")

    expect do
      described_class.perform_now([ "#existing" ])
    end.not_to have_enqueued_job(SavePlayerJob)
  end

  it "does nothing when tags array is blank" do
    expect do
      described_class.perform_now([])
    end.not_to have_enqueued_job(SavePlayerJob)
  end
end
