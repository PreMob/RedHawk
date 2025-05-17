# Simplified PowerShell script to activate environment, install required packages, and run the test

# Navigate to the AI directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Activate the redhawk_env virtual environment
Write-Host "Activating redhawk_env virtual environment..."
& "$scriptPath\redhawk_env\Scripts\Activate.ps1"

# Install required packages
Write-Host "Installing required packages..."
& pip install pandas numpy scikit-learn matplotlib openai xgboost --quiet

# Run the test script with automatic format detection
Write-Host "Running test_log_summary.py with automatic format detection..."
& python "$scriptPath\test_log_summary.py"

# Check if the test was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Test completed successfully"
} else {
    Write-Host "Test failed with exit code: $LASTEXITCODE"
}

# Deactivate the virtual environment
deactivate
Write-Host "Environment deactivated" 