#!/usr/bin/env bash
curl --verbose https://example.test/health
lftp -u "$FTP_USERNAME","$FTP_PASSWORD" "$FTP_HOST" -e 'mirror --verbose dist/ ./; bye'
