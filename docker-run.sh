#!/bin/bash

case "$1" in
  start)
    echo "Starting IP Bilgi Servisi..."
    docker-compose up -d
    echo "IP Bilgi Servisi started at http://localhost:5000"
    ;;
  stop)
    echo "Stopping IP Bilgi Servisi..."
    docker-compose down
    echo "IP Bilgi Servisi stopped"
    ;;
  restart)
    echo "Restarting IP Bilgi Servisi..."
    docker-compose down
    docker-compose up -d
    echo "IP Bilgi Servisi restarted at http://localhost:5000"
    ;;
  build)
    echo "Building IP Bilgi Servisi..."
    docker-compose build
    echo "IP Bilgi Servisi built successfully"
    ;;
  logs)
    docker-compose logs -f
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|build|logs}"
    exit 1
esac

exit 0