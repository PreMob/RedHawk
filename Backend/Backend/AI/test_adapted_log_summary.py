import os
import sys
import subprocess
import argparse

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Test the log summary generator with adapted redhawk_dataset_2.csv')
    parser.add_argument('--github-token', type=str, default=os.environ.get('GITHUB_TOKEN'),
                        help='GitHub token for AI insights (can also be set via GITHUB_TOKEN env variable)')
    parser.add_argument('--output', type=str, default=None, 
                        help='Output file for the summary')
    args = parser.parse_args()
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Path to the dataset
    dataset_path = os.path.join(script_dir, 'redhawk_dataset_2.csv')
    
    # Check if the dataset exists
    if not os.path.exists(dataset_path):
        print(f"Error: Dataset not found at {dataset_path}")
        sys.exit(1)
    
    # Step 1: Run the adapter script to convert the dataset
    print("Step 1: Adapting the dataset...")
    adapter_command = [
        sys.executable,
        os.path.join(script_dir, 'log_analysis_pipeline_adapter.py'),
        '--input', dataset_path
    ]
    
    try:
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
        
        # Step 2: Run log summary generator on the adapted file
        print("\nStep 2: Running log summary generator on the adapted file...")
        summary_command = [
            sys.executable,
            os.path.join(script_dir, 'log_summary_generator.py'),
            '--input', adapted_file,
            '--process-logs'
        ]
        
        # Add optional arguments if provided
        if args.output:
            summary_command.extend(['--output', args.output])
        
        if args.github_token:
            summary_command.extend(['--github-token', args.github_token])
        
        # Print the command (without sensitive tokens)
        print_cmd = summary_command.copy()
        if args.github_token:
            token_index = print_cmd.index('--github-token')
            print_cmd[token_index + 1] = '***'
        
        print(f"Running log summary command: {' '.join(print_cmd)}")
        
        subprocess.run(summary_command, check=True)
        print("Log summary generation completed successfully")
        
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {e}")
        if e.stdout:
            print(f"Command output:\n{e.stdout}")
        if e.stderr:
            print(f"Command error output:\n{e.stderr}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 