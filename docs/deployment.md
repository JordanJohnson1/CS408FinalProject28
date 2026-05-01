# Deployment Guide

## Overview

Production deployment uses Kamal to build a Docker image and deploy it to a single Ubuntu EC2 host.

## 1. Prepare the EC2 Host

Copy the repository to the server or paste the bootstrap script contents there, then run:

```bash
sudo DEPLOY_USER=ubuntu ./script/bootstrap_ec2.sh
```

This installs Docker, enables the Docker service, and grants Docker access to the deploy user.

## 2. Export Deployment Secrets Locally

```bash
export EC2_HOST=YOUR_EC2_PUBLIC_DNS
export KAMAL_REGISTRY_USERNAME=YOUR_GITHUB_USERNAME
export KAMAL_REGISTRY_PASSWORD=YOUR_GHCR_TOKEN
export RAILS_MASTER_KEY=YOUR_RAILS_MASTER_KEY
```

Optional:

```bash
export APP_HOST=your-domain.example.com
export KAMAL_PROXY_SSL=true
export EC2_SSH_USER=ubuntu
```

## 3. Deploy

```bash
./script/deploy_ec2.sh
```

The deploy script validates required environment variables, runs `kamal setup`, and then runs `kamal deploy`.

## 4. Verify

- Visit `/up` to confirm the Rails health endpoint responds successfully.
- Check logs with `bin/kamal logs`.
- Open the landing, play, shop, and leaderboard pages in production.

## Notes

- Production data is stored in the `stick_skater_storage` Docker volume.
- `config/deploy.yml` is intentionally driven by environment variables so secrets and hostnames are not committed.
