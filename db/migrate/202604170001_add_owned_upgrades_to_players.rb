class AddOwnedUpgradesToPlayers < ActiveRecord::Migration[8.1]
  def change
    add_column :players, :owned_upgrades, :text, default: "[]", null: false
  end
end
