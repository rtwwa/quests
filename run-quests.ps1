# Установка зависимостей backend
cd "$PSScriptRoot/back-quests"
npm install

# Установка зависимостей frontend
cd "$PSScriptRoot/front-quests"
npm install

# Возврат в корень
cd $PSScriptRoot

# Запуск backend с логом и ожиданием на ошибке
Start-Process powershell -ArgumentList "cd '$(Join-Path $PSScriptRoot back-quests)'; npm start 2>&1 | tee ..\backend.log; if ($LASTEXITCODE -ne 0) { Write-Host 'Backend crashed. See backend.log'; pause } else { pause }" -NoNewWindow

# Запуск frontend с логом и ожиданием на ошибке
Start-Process powershell -ArgumentList "cd '$(Join-Path $PSScriptRoot front-quests)'; npm run dev 2>&1 | tee ..\frontend.log; if ($LASTEXITCODE -ne 0) { Write-Host 'Frontend crashed. See frontend.log'; pause } else { pause }" -NoNewWindow

Write-Host "Both servers started in new PowerShell windows. Logs: backend.log, frontend.log" 