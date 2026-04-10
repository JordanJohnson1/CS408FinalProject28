class Run < ApplicationRecord
  belongs_to :player
  has_many :run_tricks, dependent: :destroy
  has_many :tricks, through: :run_tricks

  enum :status, { pending: 0, active: 1, finished: 2, cancelled: 3 }

  validates :status, presence: true

  def start!
    update!(status: :active, started_at: Time.current)
  end

  def finish!
    update!(status: :finished, ended_at: Time.current)
  end

  def apply_trick!(trick:, input_used:, success: true, multiplier: 1.0, combo_count: nil, occurred_at: Time.current)
    rewards = trick.reward(multiplier:)

    run_tricks.create!(
      trick:,
      success:,
      xp_awarded: rewards[:xp],
      coins_awarded: rewards[:coins],
      occurred_at:,
      input_used:
    )

    increment!(:xp_earned, rewards[:xp])
    increment!(:coins_earned, rewards[:coins])
    player.add_rewards!(xp: rewards[:xp], coins: rewards[:coins], combo_count:)
  end
end
