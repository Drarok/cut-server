#!/usr/bin/env bash
if [ "$1" == "--dev" ]; then
  npm run dev
else
  npm run start
fi
