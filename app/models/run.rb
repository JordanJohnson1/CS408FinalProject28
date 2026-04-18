class Run < ApplicationRecord
  belongs_to :player
  has_many :run_tricks, dependent: :destroy
  has_many :tricks, through: :run_tricks

  COMBO_MULTIPLIER_STEP = 0.2
  MAX_COMBO_MULTIPLIER = 3.0

  enum :status, { pending: 0, active: 1, finished: 2, cancelled: 3 }

  validates :status, presence: true

  def start!
    update!(status: :active, started_at: Time.current)
  end

  def finish!
    update!(status: :finished, ended_at: Time.current)
  end

  def apply_trick!(trick:, input_used:, success: true, occurred_at: Time.current)
    combo_count = combo_count_at(occurred_at)
    multiplier = combo_multiplier_for(combo_count)
    rewards = player.reward_for(trick, multiplier:)

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
    rewards
  end

  private

  def combo_count_at(occurred_at)
    combo_count = 1
    previous_time = occurred_at

    run_tricks.order(occurred_at: :desc, id: :desc).each do |run_trick|
      break unless run_trick.occurred_at && (previous_time - run_trick.occurred_at) * 1000 <= player.combo_reset_ms

      combo_count += 1
      previous_time = run_trick.occurred_at
    end

    combo_count
  end

  def combo_multiplier_for(combo_count)
    [1 + (combo_count - 1) * COMBO_MULTIPLIER_STEP, MAX_COMBO_MULTIPLIER].min
  end
end
