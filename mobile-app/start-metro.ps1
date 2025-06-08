#!/usr/bin/env pwsh

Write-Host "Starting React Native Metro Bundler..." -ForegroundColor Green
Set-Location $PSScriptRoot
npx react-native start --reset-cache
