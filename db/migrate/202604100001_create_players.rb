class CreatePlayers < ActiveRecord::Migration[8.1]
  def change
    create_table :players do |t|
      t.string :name, null: false
      t.string :avatar_color, default: "#0ea5e9", null: false
      t.integer :xp, default: 0, null: false
      t.integer :coins, default: 0, null: false
      t.integer :best_combo, default: 0, null: false
      t.integer :total_tricks, default: 0, null: false
      t.integer :total_coins_earned, default: 0, null: false

      t.timestamps
    end

    add_index :players, :name, unique: true
  end
end
