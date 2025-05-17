# PowerShell script to activate environment, install packages with poetry, and test log summary generator

# Navigate to the AI directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Add a function to check if a package is installed
function Test-PackageInstalled {
    param(
        [Parameter(Mandatory=$true)]
        [string]$PackageName
    )
    
    $result = & "$scriptPath\redhawk_env\Scripts\python.exe" -c "import sys, pkgutil; print(pkgutil.find_loader('$PackageName') is not None)"
    return $result.Trim() -eq "True"
}

# Check if pyproject.toml exists, create if not
if (-not (Test-Path -Path "pyproject.toml")) {
    Write-Host "Creating pyproject.toml for Poetry..."
    
    # Create a new pyproject.toml file
    @"
[tool.poetry]
name = "redhawk-ai"
version = "0.1.0"
description = "RedHawk AI components for security log analysis"
authors = ["RedHawk Team"]

[tool.poetry.dependencies]
python = "^3.8"
pandas = "^2.0.0"
numpy = "^1.24.0"
scikit-learn = "^1.3.0"
matplotlib = "^3.7.0"
openai = "^1.3.0"
xgboost = "^2.0.0"

[tool.poetry.dev-dependencies]

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
"@ | Out-File -FilePath "pyproject.toml" -Encoding utf8
    
    Write-Host "Created pyproject.toml"
}

# Activate the redhawk_env virtual environment
Write-Host "Activating redhawk_env virtual environment..."
try {
    & "$scriptPath\redhawk_env\Scripts\Activate.ps1"
    Write-Host "Environment activated successfully"
} catch {
    Write-Host "Error activating environment: $_"
    exit 1
}

# Install required packages one by one to ensure they're properly installed
$packages = @("pandas", "numpy", "scikit-learn", "matplotlib", "openai", "xgboost")
foreach ($package in $packages) {
    # Check if package is already installed
    if (-not (Test-PackageInstalled -PackageName $package)) {
        Write-Host "Installing $package..."
        try {
            & "$scriptPath\redhawk_env\Scripts\python.exe" -m pip install $package
            
            # Verify installation
            if (Test-PackageInstalled -PackageName $package) {
                Write-Host "$package installed successfully"
            } else {
                Write-Host "Failed to install $package. Exiting."
                exit 1
            }
        } catch {
            Write-Host "Error installing $package"
            exit 1
        }
    } else {
        Write-Host "$package is already installed"
    }
}

# Run the test script
Write-Host "Running test_log_summary.py..."
try {
    & "$scriptPath\redhawk_env\Scripts\python.exe" "$scriptPath\test_log_summary.py"
    Write-Host "Test completed successfully"
} catch {
    Write-Host "Error running test"
    exit 1
}

# Deactivate the virtual environment
deactivate
Write-Host "Environment deactivated" 