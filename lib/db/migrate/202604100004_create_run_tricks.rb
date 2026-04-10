class CreateRunTricks < ActiveRecord::Migration[8.1]
  def change
    create_table :run_tricks do |t|
      t.belongs_to :run, null: false, foreign_key: true
      t.belongs_to :trick, null: false, foreign_key: true
      t.boolean :success, default: true, null: false
      t.integer :xp_awarded, default: 0, null: false
      t.integer :coins_awarded, default: 0, null: false
      t.datetime :occurred_at
      t.string :input_used

      t.timestamps
    end

    add_index :run_tricks, :occurred_at
  end
end
