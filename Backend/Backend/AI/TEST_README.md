# Testing the Log Summary Generator

This directory contains scripts to test the log summary generator using the `redhawk_dataset_2.csv` file.

## Prerequisites

- Python 3.8 or higher
- Virtual environment (redhawk_env)

## Running the Test

### On Windows

1. Open PowerShell
2. Navigate to this directory
3. Run the PowerShell script:
   ```
   .\run_test_simple.ps1
   ```

### On Linux/Mac

1. Open a terminal
2. Navigate to this directory
3. Make the script executable:
   ```
   chmod +x run_test.sh
   ```
4. Run the script:
   ```
   ./run_test.sh
   ```

## What the Test Does

1. Activates the redhawk_env virtual environment
2. Installs required dependencies
3. **Automatically detects** if the dataset needs format adaptation
4. If adaptation is needed, uses the adapter to convert the dataset
5. Runs the log summary generator on the dataset
6. Generates a summary of the log analysis

## Automatic Format Detection

The script now automatically checks if the dataset has the required columns expected by the model. If the required columns are missing, it uses the adapter to:

1. Map columns from the new format to the format expected by the model
2. Add missing columns with reasonable default values
3. Process the adapted dataset with the model

This means you can use the log summary generator with datasets in different formats without manual intervention.

## Optional Arguments

You can run the test script with additional arguments:

### GitHub Token for AI Insights

```
python test_log_summary.py --github-token YOUR_TOKEN
```

### Custom Output File

```
python test_log_summary.py --output custom_output.json
```

### Custom Input Dataset

```
python test_log_summary.py --input path/to/your/dataset.csv
```

## Error Handling

The scripts now include better error handling to:

1. Gracefully handle missing columns in the dataset
2. Provide default values for required columns
3. Detect and report issues during processing
4. Safely adapt incompatible datasets to the model format

## Output

The script will generate a JSON file containing the summary analysis, which includes:
- File summaries
- Prediction statistics
- Sensitivity levels
- Visualization data
- AI-generated insights (if a GitHub token is provided) 