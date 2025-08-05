# Тестирование игровой логики Artel Billiards
# PowerShell скрипт для тестирования API

$API_BASE_URL = "http://localhost:8000"
$testResults = @()

function Log-Test {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Details = ""
    )
    
    $status = if ($Success) { "✅ PASS" } else { "❌ FAIL" }
    Write-Host "$status $TestName"
    if ($Details) {
        Write-Host "   $Details"
    }
    
    $testResults += @{
        Test = $TestName
        Success = $Success
        Details = $Details
    }
}

function Test-APIGatewayHealth {
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE_URL/health" -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Log-Test "API Gateway Health" $true "Status: $($response.StatusCode)"
            return $true
        } else {
            Log-Test "API Gateway Health" $false "Status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Log-Test "API Gateway Health" $false "Error: $($_.Exception.Message)"
        return $false
    }
}

function Test-GetTemplates {
    try {
        $response = Invoke-WebRequest -Uri "$API_BASE_URL/api/v1/templates/" -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            $templatesCount = $data.templates.Count
            Log-Test "Get Templates" $true "Found $templatesCount templates"
            return $data.templates
        } else {
            Log-Test "Get Templates" $false "Status: $($response.StatusCode)"
            return @()
        }
    } catch {
        Log-Test "Get Templates" $false "Error: $($_.Exception.Message)"
        return @()
    }
}

function Test-CreateSession {
    try {
        $sessionData = @{
            game_type_id = 1
            name = "Test Session - Kolkhoz"
            max_players = 4
            rules = @{
                point_value_rubles = 100
                payment_direction = "previous_pays_next"
                queue_algorithm = "always_random"
            }
        } | ConvertTo-Json -Depth 3
        
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$API_BASE_URL/api/v1/sessions/" -Method POST -Body $sessionData -Headers $headers -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            $sessionId = $data.id
            Log-Test "Create Session" $true "Session ID: $sessionId"
            return $sessionId
        } else {
            Log-Test "Create Session" $false "Status: $($response.StatusCode)"
            return $null
        }
    } catch {
        Log-Test "Create Session" $false "Error: $($_.Exception.Message)"
        return $null
    }
}

function Test-JoinSession {
    param([string]$SessionId)
    
    try {
        $joinData = @{
            display_name = "Test Player"
        } | ConvertTo-Json
        
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$API_BASE_URL/api/v1/sessions/$SessionId/join" -Method POST -Body $joinData -Headers $headers -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Log-Test "Join Session" $true "Player joined successfully"
            return $true
        } else {
            Log-Test "Join Session" $false "Status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Log-Test "Join Session" $false "Error: $($_.Exception.Message)"
        return $false
    }
}

function Test-CreateGame {
    param([string]$SessionId)
    
    try {
        $gameData = @{
            queue_algorithm = "always_random"
        } | ConvertTo-Json
        
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$API_BASE_URL/api/v1/sessions/$SessionId/games" -Method POST -Body $gameData -Headers $headers -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            $gameId = $data.id
            Log-Test "Create Game" $true "Game ID: $gameId"
            return $gameId
        } else {
            Log-Test "Create Game" $false "Status: $($response.StatusCode)"
            return $null
        }
    } catch {
        Log-Test "Create Game" $false "Error: $($_.Exception.Message)"
        return $null
    }
}

function Test-AddGameEvent {
    param([string]$GameId)
    
    try {
        $eventData = @{
            participant_id = "test-participant-1"
            event_type = "ball_potted"
            event_data = @{
                ball_color = "red"
                points = 100
            }
        } | ConvertTo-Json -Depth 3
        
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$API_BASE_URL/api/v1/games/$GameId/events" -Method POST -Body $eventData -Headers $headers -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Log-Test "Add Game Event" $true "Event added successfully"
            return $true
        } else {
            Log-Test "Add Game Event" $false "Status: $($response.StatusCode)"
            return $false
        }
    } catch {
        Log-Test "Add Game Event" $false "Error: $($_.Exception.Message)"
        return $false
    }
}

function Show-TestSummary {
    Write-Host ""
    Write-Host ("=" * 60)
    Write-Host "📊 ИТОГОВЫЙ ОТЧЕТ ТЕСТИРОВАНИЯ"
    Write-Host ("=" * 60)
    
    $totalTests = $testResults.Count
    $passedTests = ($testResults | Where-Object { $_.Success }).Count
    $failedTests = $totalTests - $passedTests
    
    Write-Host "Всего тестов: $totalTests"
    Write-Host "✅ Успешно: $passedTests"
    Write-Host "❌ Провалено: $failedTests"
    Write-Host "📈 Успешность: $([math]::Round(($passedTests/$totalTests)*100, 1))%"
    
    if ($failedTests -gt 0) {
        Write-Host ""
        Write-Host "❌ Проваленные тесты:"
        foreach ($result in $testResults) {
            if (-not $result.Success) {
                Write-Host "   - $($result.Test): $($result.Details)"
            }
        }
    }
    
    Write-Host ("=" * 60)
}

# Основное тестирование
Write-Host "🎯 Тестирование игровой логики Artel Billiards"
Write-Host "=" * 60

Test-APIGatewayHealth
Test-GetTemplates

$sessionId = Test-CreateSession
if ($sessionId) {
    Test-JoinSession $sessionId
    $gameId = Test-CreateGame $sessionId
    if ($gameId) {
        Test-AddGameEvent $gameId
    }
}

Show-TestSummary 