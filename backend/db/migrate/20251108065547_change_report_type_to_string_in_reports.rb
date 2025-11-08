class ChangeReportTypeToStringInReports < ActiveRecord::Migration[8.0]
  def change
    change_column :reports, :report_type, :string
  end
end
