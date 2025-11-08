class AddAppealCommentAndReviewCommentToReports < ActiveRecord::Migration[8.0]
  def change
    add_column :reports, :appeal_comment, :text
    add_column :reports, :review_comment, :text
  end
end
