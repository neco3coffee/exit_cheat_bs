require 'rails_helper'

RSpec.describe Test, type: :model do
  describe 'basic functionality' do
    it 'can create a test record' do
      test = create(:test, name: "TestPlayer")
      expect(test.name).to eq("TestPlayer")
      expect(test).to be_persisted
    end

    it 'validates presence of name' do
      test = build(:test, name: nil)
      expect(test).not_to be_valid
      expect(test.errors[:name]).to include("can't be blank")
    end

    it 'validates maximum length of name' do
      test = build(:test, name: "A" * 16)
      expect(test).not_to be_valid
      expect(test.errors[:name]).to include("is too long (maximum is 15 characters)")
    end
  end
end
