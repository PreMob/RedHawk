import pickle
import numpy as np
import pandas as pd
import os
import argparse
import sys
from datetime import datetime
from log_analysis_pipeline import load_model, process_log_file

def adapt_dataset(file_path, output_dir=None):
    """
    Adapt the redhawk_dataset_2.csv format to match the format expected by the model
    """
    try:
        print(f"Adapting dataset: {file_path}")
        
        # Read the CSV file
        try:
            data = pd.read_csv(file_path)
        except Exception as e:
            print(f"Error reading CSV file: {str(e)}")
            return None
        
        if data.empty:
            print(f"Warning: Empty file {file_path}, skipping")
            return None
        
        print(f"Original columns: {data.columns.tolist()}")
        print(f"Original shape: {data.shape}")
        
        # Create a new dataframe with the expected columns
        # Map existing columns to the expected format where possible
        adapted_data = pd.DataFrame()
        
        # Map column names from new format to expected format
        # These mappings are based on typical IDS features
        column_map = {
            'protocol': 'protocol_type',
            'service': 'service', 
            'flag': 'flag',
            'bytes': 'bytes',
            'duration': 'duration',
            'src_port': 'src_port',
            'dst_port': 'dst_port'
        }
        
        # Copy mapped columns
        for source, target in column_map.items():
            if source in data.columns:
                adapted_data[target] = data[source]
            else:
                print(f"Warning: Source column '{source}' not found, using default values for '{target}'")
                # Use default values based on column type
                if 'port' in target:
                    adapted_data[target] = 0  # Default port number
                elif target == 'protocol_type':
                    adapted_data[target] = 'tcp'  # Default protocol
                elif target == 'service':
                    adapted_data[target] = 'http'  # Default service
                elif target == 'flag':
                    adapted_data[target] = 'SF'  # Default flag (normal)
                elif target in ['bytes', 'duration']:
                    adapted_data[target] = 0  # Default numeric value
                else:
                    adapted_data[target] = 'unknown'  # Default string
        
        # Add binary features (0/1) based on existing data
        try:
            if 'src_ip' in data.columns and 'dst_ip' in data.columns and 'src_port' in data.columns and 'dst_port' in data.columns:
                adapted_data['land'] = ((data['src_ip'] == data['dst_ip']) & 
                                        (data['src_port'] == data['dst_port'])).astype(int)
            else:
                print("Warning: IP or port columns missing, using default value for 'land'")
                adapted_data['land'] = 0
        except Exception as e:
            print(f"Error processing 'land' feature: {str(e)}")
            adapted_data['land'] = 0
        
        adapted_data['wrong_fragment'] = 0  # Default to 0
        adapted_data['urgent'] = 0  # Default to 0
        
        # Use auth_result to determine logged_in
        try:
            if 'auth_result' in data.columns:
                adapted_data['logged_in'] = data['auth_result'].apply(
                    lambda x: 1 if str(x).lower() in ['success', 'successful', 'true', '1'] else 0
                )
            else:
                print("Warning: 'auth_result' column missing, using default value for 'logged_in'")
                adapted_data['logged_in'] = 0
        except Exception as e:
            print(f"Error processing 'logged_in' feature: {str(e)}")
            adapted_data['logged_in'] = 0
        
        # Add remaining required columns with default values
        adapted_data['root_shell'] = 0
        adapted_data['su_attempted'] = 0
        adapted_data['is_host_login'] = 0
        adapted_data['is_guest_login'] = 0
        
        # Add basic network features
        adapted_data['count'] = 1
        adapted_data['srv_count'] = 1
        adapted_data['serror_rate'] = 0
        adapted_data['srv_serror_rate'] = 0
        adapted_data['rerror_rate'] = 0
        adapted_data['srv_rerror_rate'] = 0
        adapted_data['same_srv_rate'] = 1
        adapted_data['diff_srv_rate'] = 0
        adapted_data['srv_diff_host_rate'] = 0
        
        # Add the 'class' column if attack_type is available
        try:
            if 'attack_type' in data.columns:
                # Map attack types to classes
                adapted_data['class'] = data['attack_type'].apply(
                    lambda x: 'normal' if pd.isna(x) or str(x).lower() in ['normal', 'none', 'nan', '']
                    else 'attack'
                )
            elif 'is_malware' in data.columns:
                # Use is_malware to determine class
                adapted_data['class'] = data['is_malware'].apply(
                    lambda x: 'attack' if str(x).lower() in ['true', '1', 'yes'] else 'normal'
                )
            else:
                print("Warning: No attack type indicators found, using default 'normal' class")
                adapted_data['class'] = 'normal'
        except Exception as e:
            print(f"Error processing 'class' feature: {str(e)}")
            adapted_data['class'] = 'normal'
        
        # Add source data columns with original values for reference
        # Use prefix to avoid column name conflicts
        for col in data.columns:
            adapted_data[f'original_{col}'] = data[col]
            
        # Ensure all expected columns are present
        expected_columns = [
            'protocol_type', 'service', 'flag', 'land', 'wrong_fragment', 'urgent',
            'logged_in', 'root_shell', 'su_attempted', 'is_host_login', 'is_guest_login',
            'count', 'srv_count', 'serror_rate', 'srv_serror_rate', 'rerror_rate',
            'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate', 'srv_diff_host_rate',
            'class'
        ]
        
        for col in expected_columns:
            if col not in adapted_data.columns:
                print(f"Warning: Required column '{col}' missing, adding default values")
                adapted_data[col] = 'default' if col in ['protocol_type', 'service', 'flag', 'class'] else 0
            
        print(f"Adapted columns: {adapted_data.columns.tolist()}")
        print(f"Adapted shape: {adapted_data.shape}")
        
        # Generate output file name
        try:
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)
                base_name = os.path.basename(file_path)
                name_without_ext = os.path.splitext(base_name)[0]
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_path = os.path.join(output_dir, f"{name_without_ext}_adapted_{timestamp}.csv")
            else:
                dir_name = os.path.dirname(file_path)
                base_name = os.path.basename(file_path)
                name_without_ext = os.path.splitext(base_name)[0]
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_path = os.path.join(dir_name, f"{name_without_ext}_adapted_{timestamp}.csv")
            
            # Save adapted dataset
            adapted_data.to_csv(output_path, index=False)
            print(f"Adapted dataset saved to: {output_path}")
            
            return output_path
        except Exception as e:
            print(f"Error saving adapted dataset: {str(e)}")
            return None
        
    except Exception as e:
        print(f"Error adapting dataset {file_path}: {str(e)}")
        return None

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Adapt and process log files for the log summary generator.')
    parser.add_argument('--model', type=str, default='best_model.pkl', 
                        help='Path to the pickled model file')
    parser.add_argument('--input', type=str, required=True, 
                        help='Path to input log file or directory of log files')
    parser.add_argument('--output', type=str, default=None, 
                        help='Output directory for prediction files')
    parser.add_argument('--skip-processing', action='store_true',
                        help='Skip processing with the model, only adapt the dataset')
    
    args = parser.parse_args()
    
    # Adapt the dataset
    adapted_file = adapt_dataset(args.input, args.output)
    
    if not adapted_file:
        print("Dataset adaptation failed")
        sys.exit(1)
    
    # Skip processing if requested
    if args.skip_processing:
        print("Skipping model processing as requested")
        print(f"Adapted file saved to: {adapted_file}")
        sys.exit(0)
    
    # Load the model and process the adapted file
    try:
        model_components = load_model(args.model)
        
        # Process the adapted file
        output_path = process_log_file(adapted_file, model_components, args.output)
        
        if output_path:
            print(f"Processing completed, results saved to: {output_path}")
        else:
            print("Processing failed")
            sys.exit(1)
            
    except Exception as e:
        print(f"Error during processing: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 