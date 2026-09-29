#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose git nginx
systemctl start docker
systemctl enable docker
