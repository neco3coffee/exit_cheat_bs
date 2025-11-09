module Api
  module V1
    class ReportsController < ApplicationController
      # protect_from_forgery with: :null_session
      before_action :authenticate_reporter, only: [:create, :signed_url, :update]

      # POST /api/v1/reports
      def create
        report = Report.new(
          reporter_tag: params[:reporterTag],
          battle_data: params[:battleLog],
          status: :created,
        )

        if report.save
          render json: { reportId: report.id }, status: :created
        else
          render json: { errors: report.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/reports/:id
      def show
        session_token = cookies[:session_token]

        unless session_token
          render json: { error: 'Unauthorized' }, status: :unauthorized
          return
        end

        session = Session.find_by(session_token: session_token)
        player = session.player

        unless player
          render json: { error: 'Forbidden' }, status: :forbidden
          return
        end

        report = Report.find(params[:id])

        if report && player
          render json: {
            report: report,
            player_role: player.role,
            player_tag: player.tag
          }, status: :ok
        else
          render json: { error: 'Report not found' }, status: :not_found
        end
      end


      # GET /api/v1/reports/:id/signed_url
      def signed_url
        report = Report.find(params[:id])

        if report.nil?
          render json: { error: 'Report not found' }, status: :not_found
          return
        end

        # reportのカラムを更新
        report.assign_attributes(
          reported_tag: params[:reportedPlayerTag],
          report_type: params[:reportType],
          status: :signed_url_generated,
        )

        if report.save
          # S3署名付きURL生成
          s3 = Aws::S3::Resource.new
          bucket = ENV.fetch('AWS_BUCKET')
          ext = params[:fileType]&.split('/')&.last || 'mp4'
          object_key = "reports/#{report.uuid}/video.#{ext}"
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

        if report.nil?
          render json: { error: 'Report not found' }, status: :not_found
          return
        end

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
          reason: params[:reportReason] || '',
          status: :info_and_video_updated,
        )

          render json: { message: 'Report updated' }, status: :ok
        else
          render json: { errors: report.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/update_video
      def update_video
        api_key = request.headers['X-API-KEY']
        expected_api_key = ENV['LAMBDA_API_KEY']

        if api_key != expected_api_key
          render json: { error: 'Unauthorized' }, status: :unauthorized
          return
        end

        report = Report.find_by(uuid: params[:uuid])

        if report.nil?
          render json: { error: 'Report not found' }, status: :not_found
          return
        end

        if report.update(video_url: params[:video_url], status: :video_optimized)
          render json: { message: 'Report video URL updated' }, status: :ok
        else
          render json: { errors: report.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def voted
        report = Report.find_by(id: params[:id])
        return render json: { error: "Report not found" }, status: :not_found unless report

        result = params[:result]

        case result
        when "griefer"
          report.update!(status: :approved)
        when "normal"
          report.update!(status: :rejected)
        else
          # no_votes / tie などはとりあえず保留に戻すなど
          report.update!(status: :waiting_review)
        end

        render json: { message: "Report updated", status: report.status }, status: :ok
      end

      def reports
        session_token = cookies[:session_token]

        unless session_token
          render json: { error: 'Unauthorized' }, status: :unauthorized
          return
        end

        session = Session.find_by(session_token: session_token)
        player = session.player

        unless player
          render json: { error: 'Forbidden' }, status: :forbidden
          return
        end

        render json: Report.where(reporter_tag: player.tag).order(created_at: :desc), status: :ok
      end

      def index
        # sessionを確認し、playerがmoderatorかadminでなければ403を返す
        session_token = cookies[:session_token]


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

      private

      def authenticate_reporter
        session_token = cookies[:session_token]
        unless session_token
          render json: { error: 'Unauthorized' }, status: :unauthorized
          return
        end

        session = Session.find_by(session_token: session_token)
        player = session.player

        if params[:reporterTag].present?
          unless player && player.tag == params[:reporterTag]
            render json: { error: 'Forbidden' }, status: :forbidden
            return
          end
        else
          report = Report.find_by(id: params[:id])
          unless player && player.tag == report.reporter_tag
            render json: { error: 'Forbidden' }, status: :forbidden
            return
          end
        end
      end


    end
  end
end
