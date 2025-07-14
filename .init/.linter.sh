#!/bin/bash
cd /home/kavia/workspace/code-generation/classic-snake-game-c843281c/snake_game_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

