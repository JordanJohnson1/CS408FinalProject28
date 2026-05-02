# Stick Skater

Stick Skater is a full-stack Ruby on Rails web application built around an idle skating game. Players create a skater, perform trick combinations, earn coins and XP, purchase permanent upgrades, and compete on a leaderboard. The project combines interactive frontend gameplay with persistent backend data so player progress, runs, upgrades, and rankings are all saved across sessions.

## Project Overview

The goal of the project was to build a game-style web application that demonstrates both frontend and backend development in a single Rails app. Stick Skater focuses on a simple but complete gameplay loop:

1. Create a player.
2. Start a skating run.
3. Perform trick combos for rewards.
4. Use earned coins to buy upgrades.
5. Improve long-term stats and climb the leaderboard.

The application includes gameplay logic, player progression, persistent data storage, automated testing, and deployment support.

## Main Features

- Player creation with custom skater name and avatar color
- Real-time run session UI with trick input handling
- Combo-based coin and XP rewards
- Permanent shop upgrades that affect future runs
- Leaderboard rankings based on player performance
- Player profile pages with saved stats and recent run history
- Persistent progress using a relational database
- Automated test coverage for core gameplay and app flows
- Deployment-ready configuration for EC2 using Kamal

## Stack

- Ruby 3.4.8
- Rails 8.1
- SQLite
- Hotwire and Stimulus
- Bootstrap 5
- Minitest
- GitHub Actions CI
- Kamal deployment to AWS EC2

## App Structure

Key parts of the application include:

- `app/models/player.rb`: player stats, upgrades, rewards, and leaderboard logic
- `app/models/run.rb`: run lifecycle and combo reward calculations
- `app/models/trick.rb`: trick definitions and reward values
- `app/controllers/runs_controller.rb`: starting and finishing runs
- `app/controllers/run_tricks_controller.rb`: saving performed tricks during gameplay
- `app/controllers/shop_upgrades_controller.rb`: shop purchases
- `app/views/pages/*.html.erb`: landing, play, shop, and leaderboard pages
- `app/javascript/controllers/*`: Stimulus controllers for live gameplay and canvas animation
- `db/schema.rb`: database structure for players, runs, tricks, and run history

## Local Setup

1. Install Ruby 3.4.8 and Bundler.
2. Install gems with `bundle install`.
3. Prepare the database with `bin/rails db:prepare`.
4. Start the app with `bin/dev`.

You can also run `bin/setup --skip-server` to install dependencies, prepare the database, and clear old temp files without starting Rails.

## Core Game Flow

1. Create a player from the landing page or play page.
2. Start a run from `/play`.
3. Perform tricks to earn coins, XP, and combo bonuses.
4. Spend coins in `/shop` on permanent upgrades.
5. Track progress on `/leaderboard` and each player profile.

## Data Model

The main database entities are:

- `players`: stores user progress, stats, and owned upgrades
- `runs`: stores each gameplay session
- `tricks`: stores trick names, difficulty, and base rewards
- `run_tricks`: stores the tricks performed within each run

Together, these models support persistent progression and leaderboard tracking.

## Testing

Run the full automated suite with:

```bash
bin/rails test
```

The suite includes:

- Model tests for rewards, upgrades, and combo handling
- Integration tests for player creation, run lifecycle, shop purchases, leaderboard ordering, and page access

GitHub Actions runs the same Rails test suite on every push and pull request to `main`.

## Frontend and Backend Responsibilities

Frontend responsibilities include rendering the main pages, handling trick key inputs, updating the live run interface, and drawing the skating animation on the canvas.

Backend responsibilities include validating players, calculating rewards, persisting runs and run tricks, saving purchases, and ranking players on the leaderboard.

## Deployment

This project is set up for containerized deployment with Kamal to a single Ubuntu-based EC2 instance.

### Required Environment Variables

- `EC2_HOST`: public IP or DNS name of the EC2 instance
- `KAMAL_REGISTRY_USERNAME`: container registry username
- `KAMAL_REGISTRY_PASSWORD`: registry access token or password
- `RAILS_MASTER_KEY`: Rails credentials key

Optional deployment variables:

- `KAMAL_REGISTRY_IMAGE`: image name, defaults to `ghcr.io/<username>/stick-skater`
- `KAMAL_REGISTRY_SERVER`: defaults to `ghcr.io`
- `APP_HOST`: domain name used by the proxy
- `KAMAL_PROXY_SSL=true`: enable Let's Encrypt-managed TLS
- `EC2_SSH_USER`: defaults to `ubuntu`

### EC2 Automation Scripts

- `script/bootstrap_ec2.sh`: run on the EC2 instance with `sudo` to install Docker and prepare the host for Kamal
- `script/deploy_ec2.sh`: run locally after exporting deployment secrets to perform `kamal setup` and `kamal deploy`

Typical deployment flow:

```bash
ssh ubuntu@YOUR_EC2_HOST
sudo DEPLOY_USER=ubuntu ./script/bootstrap_ec2.sh
```

```bash
export EC2_HOST=YOUR_EC2_HOST
export KAMAL_REGISTRY_USERNAME=YOUR_GITHUB_USERNAME
export KAMAL_REGISTRY_PASSWORD=YOUR_REGISTRY_TOKEN
export RAILS_MASTER_KEY=YOUR_MASTER_KEY
bin/kamal setup
bin/kamal deploy
```

`config/deploy.yml` is parameterized so the same config can be reused across local deployment attempts without editing secrets into the repository.

## Documentation

- `README.md`: project overview, setup, testing, and deployment
- `docs/README.MD`: project summary for the course deliverable
- `docs/deployment.md`: deployment checklist and EC2 notes
