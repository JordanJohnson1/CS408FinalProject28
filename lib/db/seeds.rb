Trick.seed_defaults

Player.find_or_create_by!(name: "Demo Skater") do |player|
  player.avatar_color = "#0ea5e9"
end
