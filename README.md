# Stick Skater

Stick Skater is a Ruby on Rails idle skating game where players create a skater, chain tricks together for combo rewards, buy permanent upgrades, and compete on a leaderboard.

## Stack

- Ruby 3.4.8
- Rails 8.1
- SQLite
- Hotwire and Stimulus
- Bootstrap 5
- Minitest
- GitHub Actions CI
- Kamal deployment to AWS EC2

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

## Testing

Run the full automated suite with:

```bash
bin/rails test
```

The suite includes:

- Model tests for rewards, upgrades, and combo handling
- Integration tests for player creation, run lifecycle, shop purchases, leaderboard ordering, and page access

GitHub Actions runs the same Rails test suite on every push and pull request to `main`.

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
