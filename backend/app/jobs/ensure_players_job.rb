class EnsurePlayersJob < ApplicationJob
  queue_as :default

  def perform(tags)
    return if tags.blank?

    normalized_tags = Array(tags).compact.map { |tag| normalize_tag(tag) }.compact.uniq
    return if normalized_tags.empty?

    existing_tags = Player.where(tag: normalized_tags).pluck(:tag)
    missing_tags = normalized_tags - existing_tags
    return if missing_tags.empty?

    missing_tags.each do |tag|
      SavePlayerJob.perform_later(tag)
    end
  end

  private

  def normalize_tag(tag)
    return if tag.blank?

    normalized = tag.to_s.upcase.strip
    normalized = normalized.gsub("O", "0")
    normalized.start_with?("#") ? normalized : "##{normalized}"
  end
end
