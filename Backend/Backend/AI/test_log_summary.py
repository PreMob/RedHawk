import os
import sys
import subprocess
import argparse
import pandas as pd

def check_dataset_format(file_path):
    """
    Check if the dataset format is compatible with the model
    Returns True if compatible, False if needs adaptation
    """
    try:
        df = pd.read_csv(file_path)
        required_columns = ['protocol_type', 'land', 'wrong_fragment', 'urgent', 
                           'logged_in', 'root_shell', 'su_attempted', 
                           'is_host_login', 'is_guest_login']
        
        # Check if all required columns exist
        for col in required_columns:
            if col not in df.columns:
                print(f"Column '{col}' not found in dataset. Adaptation needed.")
                return False
        return True
    except Exception as e:
        print(f"Error checking dataset format: {str(e)}")
        return False

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test the log summary generator with redhawk_dataset_2.csv')
    parser.add_argument('--github-token', type=str, default=os.environ.get('GITHUB_TOKEN'),
                        help='GitHub token for AI insights (can also be set via GITHUB_TOKEN env variable)')
    parser.add_argument('--output', type=str, default=None, 
                        help='Output file for the summary')
    parser.add_argument('--input', type=str, default=None,
                        help='Path to input dataset (default: redhawk_dataset_2.csv in the current directory)')
    args = parser.parse_args()
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to the dataset
    if args.input:
        dataset_path = args.input
    else:
        dataset_path = os.path.join(script_dir, 'redhawk_dataset_2.csv')
    
    # Check if the dataset exists
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        sys.exit(1)
    
    # Check if the dataset needs adaptation
    needs_adaptation = not check_dataset_format(dataset_path)
    
    if needs_adaptation:
        print(f"Dataset format requires adaptation. Using adapter...")
        # Run the adapter script
        try:
            adapter_command = [
                sys.executable,
                os.path.join(script_dir, 'log_analysis_pipeline_adapter.py'),
                '--input', dataset_path
            ]
            
            print(f"Running adapter command: {' '.join(adapter_command)}")
            adapter_process = subprocess.run(adapter_command, check=True, capture_output=True, text=True)
            
            # Parse the output to get the adapted file path
            adapter_output = adapter_process.stdout
            print(adapter_output)
            
            # Find the line with the adapted file path
            adapted_file_line = [line for line in adapter_output.split('\n') if "Adapted dataset saved to" in line]
            if not adapted_file_line:
                print("Could not find the adapted file path in the output")
                sys.exit(1)
                
            # Extract the adapted file path
            adapted_file = adapted_file_line[0].split("Adapted dataset saved to: ")[-1].strip()
            
            if not os.path.exists(adapted_file):
                print(f"Adapted file not found at: {adapted_file}")
                sys.exit(1)
                
            print(f"Successfully adapted dataset to: {adapted_file}")
            input_file = adapted_file
        except subprocess.CalledProcessError as e:
            print(f"Error running adapter: {e}")
            if e.stdout:
                print(f"Adapter output:\n{e.stdout}")
            if e.stderr:
                print(f"Adapter error output:\n{e.stderr}")
            sys.exit(1)
    else:
        print("Dataset format is compatible with the model. No adaptation needed.")
        input_file = dataset_path
    
    # Construct the command to run log_summary_generator.py
    command = [
        sys.executable,
        os.path.join(script_dir, 'log_summary_generator.py'),
        '--input', input_file,
        '--process-logs'  # Process the raw log file before generating summary
    ]
    
    # Add optional arguments if provided
    if args.output:
        command.extend(['--output', args.output])
    
    if args.github_token:
        command.extend(['--github-token', args.github_token])
    
    # Print the command (without sensitive tokens)
    print_cmd = command.copy()
    if args.github_token:
        token_index = print_cmd.index('--github-token')
        print_cmd[token_index + 1] = '***'
    
    print(f"Running command: {' '.join(print_cmd)}")
    
    # Run the command
    try:
        subprocess.run(command, check=True)
        print("Log summary generation completed successfully")
    except subprocess.CalledProcessError as e:
        print(f"Error running log summary generator: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 