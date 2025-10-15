module Api
  module V1
    class ReportsController < ApplicationController
      # protect_from_forgery with: :null_session

      # POST /api/v1/reports
      def create
        report = Report.new(
          reporter_tag: params[:reporterTag],
          battle_data: params[:battleLog],
          reported_tag: params[:reportedPlayerTag],
          report_type: params[:reportType],
          status: 'pending'
        )
        if report.save
          # S3署名付きURL生成
          s3 = Aws::S3::Resource.new
          bucket = ENV.fetch('AWS_BUCKET')
          ext = params[:fileType]&.split('/')&.last || 'mp4'
          object_key = "reports/#{report.id}/video.#{ext}"
          signer = Aws::S3::Presigner.new
          signed_url = signer.presigned_url(:put_object,
            bucket: bucket,
            key: object_key,
            content_type: params[:fileType],
            expires_in: 60 * 10 # 10分
          )
          cdn_url = File.join(ENV.fetch('CDN_URL'), object_key)
          render json: { reportId: report.id, signedUrl: signed_url, cdnUrl: cdn_url }, status: :created
        else
          render json: { errors: report.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/reports/:id
      def update
        report = Report.find(params[:id])
        if report.update(
          video_url: params[:cdnUrl],
          reason: params[:reportReason],
          status: 'waiting_review'
        )
          render json: { message: 'Report updated' }, status: :ok
        else
          render json: { errors: report.errors.full_messages }, status: :unprocessable_entity
        end
      end


    end
  end
end
