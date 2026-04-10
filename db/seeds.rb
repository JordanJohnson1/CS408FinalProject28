tricks = [
  { name: "Ollie", input_sequence: "space", base_xp: 20, base_coins: 5, difficulty: 1 },
  { name: "Kickflip", input_sequence: "left+space", base_xp: 45, base_coins: 12, difficulty: 2 },
  { name: "Heelflip", input_sequence: "right+space", base_xp: 50, base_coins: 12, difficulty: 2 },
  { name: "Shuvit", input_sequence: "down+space", base_xp: 35, base_coins: 10, difficulty: 2 },
  { name: "Manual", input_sequence: "up", base_xp: 30, base_coins: 8, difficulty: 1 },
  { name: "360 Flip", input_sequence: "left+up+space", base_xp: 120, base_coins: 30, difficulty: 4 },
  { name: "Nose Manual", input_sequence: "up+space", base_xp: 70, base_coins: 18, difficulty: 3 },
  { name: "Backside 180", input_sequence: "left+down+space", base_xp: 80, base_coins: 20, difficulty: 3 }
]

tricks.each do |attrs|
  Trick.find_or_create_by!(name: attrs[:name]) do |trick|
    trick.input_sequence = attrs[:input_sequence]
    trick.base_xp = attrs[:base_xp]
    trick.base_coins = attrs[:base_coins]
    trick.difficulty = attrs[:difficulty]
  end
end

Player.find_or_create_by!(name: "Demo Skater") do |player|
  player.avatar_color = "#0ea5e9"
end
