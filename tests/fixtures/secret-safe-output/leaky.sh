#!/usr/bin/env bash
curl --verbose \
  --user "$FTP_USERNAME:$FTP_PASSWORD" \
  "ftp://$FTP_HOST:$FTP_PORT/"
