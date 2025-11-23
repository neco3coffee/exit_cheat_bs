require 'rails_helper'

RSpec.describe UpdateSoloRankedRanksJob, type: :job do
  let(:player1) { create(:player, tag: '#PLAYER1', rank: 10) }
  let(:player2) { create(:player, tag: '#PLAYER2', rank: 15) }
  let(:player3) { create(:player, tag: '#PLAYER3', rank: 5) }

  let(:battlelog_data) do
    {
      'items' => [
        {
          'battleTime' => '20251005T110543.000Z',
          'event' => {
            'id' => 15000081,
            'mode' => 'bounty',
            'map' => 'Excel'
          },
          'battle' => {
            'mode' => 'bounty',
            'type' => 'soloRanked',
            'result' => 'victory',
            'duration' => 120,
            'teams' => [
              [
                {
                  'tag' => '#PLAYER1',
                  'name' => 'TestPlayer1',
                  'brawler' => {
                    'id' => 16000087,
                    'name' => 'JUJU',
                    'power' => 9,
                    'trophies' => 20
                  }
                },
                {
                  'tag' => '#PLAYER2',
                  'name' => 'TestPlayer2',
                  'brawler' => {
                    'id' => 16000014,
                    'name' => 'BO',
                    'power' => 11,
                    'trophies' => 18
                  }
                },
                {
                  'tag' => '#PLAYER3',
                  'name' => 'TestPlayer3',
                  'brawler' => {
                    'id' => 16000038,
                    'name' => 'SURGE',
                    'power' => 11,
                    'trophies' => 15
                  }
                }
              ],
              [
                {
                  'tag' => '#ENEMY1',
                  'name' => 'Enemy1',
                  'brawler' => {
                    'id' => 16000010,
                    'name' => 'EL PRIMO',
                    'power' => 9,
                    'trophies' => 14
                  }
                },
                {
                  'tag' => '#ENEMY2',
                  'name' => 'Enemy2',
                  'brawler' => {
                    'id' => 16000043,
                    'name' => 'EDGAR',
                    'power' => 11,
                    'trophies' => 16
                  }
                },
                {
                  'tag' => '#ENEMY3',
                  'name' => 'Enemy3',
                  'brawler' => {
                    'id' => 16000012,
                    'name' => 'CROW',
                    'power' => 11,
                    'trophies' => 13
                  }
                }
              ]
            ]
          }
        },
        {
          'battleTime' => '20251005T110343.000Z',
          'battle' => {
            'type' => 'soloRanked',
            'teams' => [
              [
                {
                  'tag' => '#PLAYER1',
                  'name' => 'TestPlayer1',
                  'brawler' => {
                    'trophies' => 22 # より高いトロフィー
                  }
                },
                {
                  'tag' => '#PLAYER4',
                  'name' => 'TestPlayer4',
                  'brawler' => {
                    'trophies' => 12
                  }
                },
                {
                  'tag' => '#PLAYER5',
                  'name' => 'TestPlayer5',
                  'brawler' => {
                    'trophies' => 19
                  }
                }
              ],
              [
                {
                  'tag' => '#ENEMY4',
                  'name' => 'Enemy4',
                  'brawler' => {
                    'trophies' => 17
                  }
                },
                {
                  'tag' => '#ENEMY5',
                  'name' => 'Enemy5',
                  'brawler' => {
                    'trophies' => 11
                  }
                },
                {
                  'tag' => '#ENEMY6',
                  'name' => 'Enemy6',
                  'brawler' => {
                    'trophies' => 21
                  }
                }
              ]
            ]
          }
        },
        {
          'battle' => {
            'type' => 'teamRanked', # soloRanked以外は無視される
            'teams' => [
              [
                {
                  'tag' => '#PLAYER1',
                  'brawler' => { 'trophies' => 100 }
                }
              ]
            ]
          }
        }
      ]
    }
  end

  describe '#perform' do
    before do
      # テスト用のプレイヤーを作成
      player1
      player2
      player3
    end

    it 'updates ranks for players in soloRanked battles' do
      # ジョブを実行
      described_class.new.perform(battlelog_data)

      # データベースから最新の情報を取得
      player1.reload
      player2.reload
      player3.reload

      # ランクが更新されていることを確認
      expect(player1.rank).to eq(22) # より高いトロフィーで更新（複数バトルで最高値）
      expect(player2.rank).to eq(18)
      expect(player3.rank).to eq(15)
    end

    it 'ignores non-soloRanked battles' do
      # teamRankedのみのデータ
      team_ranked_data = {
        'items' => [
          {
            'battle' => {
              'type' => 'teamRanked',
              'teams' => [
                [
                  {
                    'tag' => '#PLAYER1',
                    'brawler' => { 'trophies' => 100 }
                  }
                ]
              ]
            }
          }
        ]
      }

      original_rank = player1.rank

      # ジョブを実行
      described_class.new.perform(team_ranked_data)

      # ランクが変更されていないことを確認
      player1.reload
      expect(player1.rank).to eq(original_rank)
    end

    it 'handles missing player gracefully' do
      # 存在しないプレイヤーのデータ
      missing_player_data = {
        'items' => [
          {
            'battle' => {
              'type' => 'soloRanked',
              'teams' => [
                [
                  {
                    'tag' => '#NONEXISTENT',
                    'brawler' => { 'trophies' => 25 }
                  }
                ]
              ]
            }
          }
        ]
      }

      # エラーが発生せずに完了することを確認
      expect { described_class.new.perform(missing_player_data) }.not_to raise_error
    end

    it 'handles nil battlelog_data' do
      expect { described_class.new.perform(nil) }.not_to raise_error
    end

    it 'handles empty battlelog_data' do
      empty_data = { 'items' => [] }
      expect { described_class.new.perform(empty_data) }.not_to raise_error
    end

    it 'uses the highest trophies when player appears multiple times' do
      # 同じプレイヤーが複数回登場するデータ
      multiple_appearances_data = {
        'items' => [
          {
            'battle' => {
              'type' => 'soloRanked',
              'teams' => [
                [
                  {
                    'tag' => '#PLAYER1',
                    'brawler' => { 'trophies' => 15 }
                  }
                ],
                []
              ]
            }
          },
          {
            'battle' => {
              'type' => 'soloRanked',
              'teams' => [
                [
                  {
                    'tag' => '#PLAYER1',
                    'brawler' => { 'trophies' => 25 } # より高い値
                  }
                ],
                []
              ]
            }
          },
          {
            'battle' => {
              'type' => 'soloRanked',
              'teams' => [
                [
                  {
                    'tag' => '#PLAYER1',
                    'brawler' => { 'trophies' => 20 } # より低い値
                  }
                ],
                []
              ]
            }
          }
        ]
      }

      described_class.new.perform(multiple_appearances_data)

      player1.reload
      expect(player1.rank).to eq(25) # 最も高い値で更新される
    end

    it 'processes real battlelog data structure correctly' do
      # 実際のAPIレスポンス形式のデータ
      real_data = {
        'items' => [
          {
            'battleTime' => '20251005T110543.000Z',
            'event' => {
              'id' => 15000081,
              'mode' => 'bounty',
              'map' => 'Excel'
            },
            'battle' => {
              'mode' => 'bounty',
              'type' => 'soloRanked',
              'result' => 'victory',
              'duration' => 120,
              'starPlayer' => {
                'tag' => '#9YGPRYUVR',
                'name' => '@bhiyàn'
              },
              'teams' => [
                [
                  {
                    'tag' => '#PLAYER1',
                    'name' => '@bhiyàn',
                    'brawler' => {
                      'id' => 16000087,
                      'name' => 'JUJU',
                      'power' => 9,
                      'trophies' => 10
                    }
                  },
                  {
                    'tag' => '#88LJYPCPQ',
                    'name' => '小熊貓美樂蒂',
                    'brawler' => {
                      'id' => 16000014,
                      'name' => 'BO',
                      'power' => 11,
                      'trophies' => 10
                    }
                  },
                  {
                    'tag' => '#LYYG9LPUJ',
                    'name' => '鬥士',
                    'brawler' => {
                      'id' => 16000038,
                      'name' => 'SURGE',
                      'power' => 11,
                      'trophies' => 11
                    }
                  }
                ],
                [
                  {
                    'tag' => '#2Q028VVY28',
                    'name' => 'MIMISAMONI',
                    'brawler' => {
                      'id' => 16000010,
                      'name' => 'EL PRIMO',
                      'power' => 9,
                      'trophies' => 10
                    }
                  },
                  {
                    'tag' => '#2LRULQQCGL',
                    'name' => 'CHEDO SANGMA',
                    'brawler' => {
                      'id' => 16000043,
                      'name' => 'EDGAR',
                      'power' => 11,
                      'trophies' => 10
                    }
                  },
                  {
                    'tag' => '#2QUP8RPQGP',
                    'name' => 'sSs',
                    'brawler' => {
                      'id' => 16000012,
                      'name' => 'CROW',
                      'power' => 11,
                      'trophies' => 10
                    }
                  }
                ]
              ]
            }
          }
        ]
      }

      # player1のランクのみテスト（他のプレイヤーはDBに存在しない想定）
      original_rank = player1.rank

      described_class.new.perform(real_data)

      player1.reload
      expect(player1.rank).to eq(10) # 実際のデータのトロフィー値
    end
  end

  describe 'job execution' do
    it 'can be enqueued' do
      expect {
        UpdateSoloRankedRanksJob.perform_later(battlelog_data, priority: 60)
      }.to have_enqueued_job(UpdateSoloRankedRanksJob).with(battlelog_data)
    end
  end
end
