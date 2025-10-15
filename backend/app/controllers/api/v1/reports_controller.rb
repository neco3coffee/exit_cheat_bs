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

        # statusのみの更新をしたい
        if params[:status] == 'approved' || params[:status] == 'rejected'
          if report.update(status: params[:status])
            render json: { message: 'Report status updated' }, status: :ok
          else
            render json: { errors: report.errors.full_messages }, status: :unprocessable_entity
          end
          return
        end

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

      def index
        # sessionを確認し、playerがmoderatorかadminでなければ403を返す
        # Bearer 99eea99bc8e86bf601d7ff799da82d0123d06f6f0c8443866ab46c2545c19a97 この文字のsession_token部分
        session_token = request.headers['Authorization']&.split(' ')&.last
        Rails.logger.info("Authorization Header: #{request.headers['Authorization']}")
        unless session_token
          render json: { error: 'Unauthorized' }, status: :unauthorized
          return
        end

        session = Session.find_by(session_token: session_token)
        player = session.player
        unless player && ['moderator', 'admin'].include?(player.role)
          render json: { error: 'Forbidden' }, status: :forbidden
          return
        end

        reports = Report.where(status: 'waiting_review').order(created_at: :asc)
        render json: reports, status: :ok
      end

      def latest

        reports = Report.where(status: 'approved').order(updated_at: :desc).limit(10)
        render json: reports, status: :ok
      end


    end
  end
end
