class CreateRuns < ActiveRecord::Migration[8.1]
  def change
    create_table :runs do |t|
      t.belongs_to :player, null: false, foreign_key: true
      t.integer :status, null: false, default: 0
      t.integer :duration_ms, default: 0, null: false
      t.integer :coins_earned, default: 0, null: false
      t.integer :xp_earned, default: 0, null: false
      t.datetime :started_at
      t.datetime :ended_at

      t.timestamps
    end

    add_index :runs, :status
    add_index :runs, :created_at
  end
end
