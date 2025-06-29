# Geolocation API Endpoint Test Script
# Testing /api/auth/register, /api/auth/login, /api/devices/register, /api/locations endpoints

$baseUrl = "http://localhost:3000"
$testEmail = "test$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$testPassword = "TestPass123!"

Write-Host "🚀 Starting API Endpoint Tests" -ForegroundColor Green
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host "Test Email: $testEmail" -ForegroundColor Yellow
Write-Host ""

# Global variables to store tokens and IDs
$authToken = ""
$deviceId = ""

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Body = "",
        [hashtable]$Headers = @{}
    )
    
    try {
        $requestParams = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            Headers = $Headers
        }
        
        if ($Body -ne "") {
            $requestParams.Body = $Body
        }
        
        $response = Invoke-RestMethod @requestParams
        return @{
            Success = $true
            StatusCode = 200  # RestMethod only returns on success
            Data = $response
        }
    }
    catch {
        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        return @{
            Success = $false
            StatusCode = $statusCode
            Error = $_.Exception.Message
        }
    }
}

# Test 1: Register a new user
Write-Host "📝 Test 1: POST /api/auth/register" -ForegroundColor Cyan

$registerData = @{
    email = $testEmail
    password = $testPassword
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

$registerResponse = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/api/auth/register" -Body $registerData

if ($registerResponse.Success) {
    Write-Host "✅ PASS - User registration successful" -ForegroundColor Green
    Write-Host "   Status: 200/201 ✓" -ForegroundColor Green
    Write-Host "   Response: $($registerResponse.Data | ConvertTo-Json -Compress)" -ForegroundColor DarkGreen
} else {
    Write-Host "❌ FAIL - User registration failed" -ForegroundColor Red
    Write-Host "   Status: $($registerResponse.StatusCode)" -ForegroundColor Red
    Write-Host "   Error: $($registerResponse.Error)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Login user
Write-Host "🔐 Test 2: POST /api/auth/login" -ForegroundColor Cyan

$loginData = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

$loginResponse = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/api/auth/login" -Body $loginData

if ($loginResponse.Success -and $loginResponse.Data.token) {
    $authToken = $loginResponse.Data.token
    Write-Host "✅ PASS - User login successful" -ForegroundColor Green
    Write-Host "   Status: 200/201 ✓" -ForegroundColor Green
    Write-Host "   Token received: ✓" -ForegroundColor Green
    Write-Host "   Response: $($loginResponse.Data | ConvertTo-Json -Compress)" -ForegroundColor DarkGreen
} else {
    Write-Host "❌ FAIL - User login failed" -ForegroundColor Red
    Write-Host "   Status: $($loginResponse.StatusCode)" -ForegroundColor Red
    Write-Host "   Error: $($loginResponse.Error)" -ForegroundColor Red
    Write-Host "⚠️ Cannot proceed with authenticated endpoints without token" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 3: Register a device (requires JWT)
Write-Host "📱 Test 3: POST /api/devices (Device Registration)" -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $authToken"
}

$deviceData = @{
    name = "Test Device $(Get-Date -Format 'HHmmss')"
    type = "mobile"
    platform = "android"
    version = "1.0.0"
    metadata = @{
        testDevice = $true
    }
} | ConvertTo-Json

$deviceResponse = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/api/devices" -Body $deviceData -Headers $headers

if ($deviceResponse.Success -and $deviceResponse.Data.device.id) {
    $deviceId = $deviceResponse.Data.device.id
    Write-Host "✅ PASS - Device registration successful" -ForegroundColor Green
    Write-Host "   Status: 200/201 ✓" -ForegroundColor Green
    Write-Host "   Device ID: $deviceId" -ForegroundColor Green
    Write-Host "   Response: $($deviceResponse.Data | ConvertTo-Json -Compress)" -ForegroundColor DarkGreen
} else {
    Write-Host "❌ FAIL - Device registration failed" -ForegroundColor Red
    Write-Host "   Status: $($deviceResponse.StatusCode)" -ForegroundColor Red
    Write-Host "   Error: $($deviceResponse.Error)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Store a location (requires JWT)
Write-Host "📍 Test 4: POST /api/locations (Store Location)" -ForegroundColor Cyan

if ($deviceId -ne "") {
    $locationData = @{
        latitude = 4.7110  # Bogotá coordinates for testing
        longitude = -74.0721
        accuracy = 10.5
        altitude = 2640.0
        heading = 45.0
        speed = 0.0
        deviceId = [int]$deviceId
        metadata = @{
            testLocation = $true
            source = "api_test"
        }
    } | ConvertTo-Json

    $locationResponse = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/api/locations" -Body $locationData -Headers $headers

    if ($locationResponse.Success) {
        Write-Host "✅ PASS - Location storage successful" -ForegroundColor Green
        Write-Host "   Status: 200/201 ✓" -ForegroundColor Green
        Write-Host "   Response: $($locationResponse.Data | ConvertTo-Json -Compress)" -ForegroundColor DarkGreen
    } else {
        Write-Host "❌ FAIL - Location storage failed" -ForegroundColor Red
        Write-Host "   Status: $($locationResponse.StatusCode)" -ForegroundColor Red
        Write-Host "   Error: $($locationResponse.Error)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ SKIP - No device ID available for location test" -ForegroundColor Yellow
}

Write-Host ""

# Test 5: Get locations (requires JWT)
Write-Host "📊 Test 5: GET /api/locations (Retrieve Locations)" -ForegroundColor Cyan

$getLocationsResponse = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/api/locations?limit=10" -Headers $headers

if ($getLocationsResponse.Success) {
    Write-Host "✅ PASS - Location retrieval successful" -ForegroundColor Green
    Write-Host "   Status: 200/201 ✓" -ForegroundColor Green
    Write-Host "   Locations count: $($getLocationsResponse.Data.locations.Count)" -ForegroundColor Green
    Write-Host "   Response: $($getLocationsResponse.Data | ConvertTo-Json -Compress)" -ForegroundColor DarkGreen
} else {
    Write-Host "❌ FAIL - Location retrieval failed" -ForegroundColor Red
    Write-Host "   Status: $($getLocationsResponse.StatusCode)" -ForegroundColor Red
    Write-Host "   Error: $($getLocationsResponse.Error)" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "📋 TEST SUMMARY" -ForegroundColor Magenta
Write-Host "===============" -ForegroundColor Magenta

$tests = @(
    @{ Name = "POST /api/auth/register"; Result = $registerResponse.Success }
    @{ Name = "POST /api/auth/login"; Result = $loginResponse.Success }
    @{ Name = "POST /api/devices"; Result = $deviceResponse.Success }
    @{ Name = "POST /api/locations"; Result = $locationResponse.Success }
    @{ Name = "GET /api/locations"; Result = $getLocationsResponse.Success }
)

$passedTests = 0
foreach ($test in $tests) {
    if ($test.Result) {
        Write-Host "✅ $($test.Name)" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "❌ $($test.Name)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Tests Passed: $passedTests/$($tests.Count)" -ForegroundColor $(if ($passedTests -eq $tests.Count) { "Green" } else { "Yellow" })

if ($passedTests -eq $tests.Count) {
    Write-Host "🎉 All API endpoints are working correctly!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some tests failed. Check the output above for details." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Note: All successful responses should return HTTP 200 or 201 status codes." -ForegroundColor Cyan
