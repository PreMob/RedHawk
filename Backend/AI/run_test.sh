#!/bin/bash
# Bash script to activate environment, install packages with poetry, and test log summary generator

# Navigate to the AI directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if pyproject.toml exists, create if not
if [ ! -f "pyproject.toml" ]; then
    echo "Creating pyproject.toml for Poetry..."
    
    # Create a new pyproject.toml file
    cat > pyproject.toml << EOL
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
google-generativeai = "^0.8.0"

[tool.poetry.dev-dependencies]

[build-system]
requires = ["poetry-core>=1.0.0"]
build-backend = "poetry.core.masonry.api"
EOL
    
    echo "Created pyproject.toml"
fi

# Activate the redhawk_env virtual environment
echo "Activating redhawk_env virtual environment..."
source redhawk_env/bin/activate

# Check if poetry is installed, install if not
if ! command -v poetry &> /dev/null; then
    echo "Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
fi

# Install dependencies using poetry
echo "Installing dependencies with Poetry..."
poetry install

# Run the test script
echo "Running test_log_summary.py..."
python test_log_summary.py

# Deactivate the virtual environment
deactivate 