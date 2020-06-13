#!/bin/sh

tmux new-session -s syncify \; \
  split-window -h \; \
  send-keys 'cd client && npm start' C-m \; \
  split-window -v \; \
  send-keys 'cd server && npm start' C-m \; \
  select-pane -t 0 \; \
