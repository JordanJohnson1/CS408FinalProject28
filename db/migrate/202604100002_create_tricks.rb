class CreateTricks < ActiveRecord::Migration[8.1]
  def change
    create_table :tricks do |t|
      t.string :name, null: false
      t.string :input_sequence, null: false
      t.integer :base_xp, default: 0, null: false
      t.integer :base_coins, default: 0, null: false
      t.integer :difficulty, default: 1, null: false

      t.timestamps
    end

    add_index :tricks, :name, unique: true
  end
end
