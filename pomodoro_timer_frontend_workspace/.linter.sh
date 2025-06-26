#!/bin/bash
cd /home/kavia/workspace/code-generation/focusflow-react-pomodoro-tracker-91481-d5098090/pomodoro_timer_frontend_workspace/pomodoro_timer_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

