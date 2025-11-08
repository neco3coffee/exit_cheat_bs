class RemoveNullConstraintFromReports < ActiveRecord::Migration[8.0]
  def change
    change_column_null :reports, :report_type, true
    change_column_null :reports, :reported_tag, true
  end
end
