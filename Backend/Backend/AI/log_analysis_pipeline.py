import pickle
import numpy as np
import pandas as pd
import os
import argparse
import sys
from datetime import datetime

def load_model(model_path='best_model.pkl'):
    """
    Load the trained model and preprocessing components
    """
    try:
        with open(model_path, 'rb') as f:
            model_components = pickle.load(f)
        
        print(f"Model loaded successfully from {model_path}")
        return model_components
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        sys.exit(1)

def preprocess_data(data, model_components):
    """
    Preprocess input data to match the format expected by the model
    """
    symbolic_features = model_components['symbolic_features']
    continuous_features = model_components['continuous_features']
    
    # One-hot encode categorical features
    print("One-hot encoding categorical features...")
    data_encoded = pd.get_dummies(data, columns=symbolic_features, drop_first=True)
    
    # Apply log transformation to continuous features
    print("Applying log transformation...")
    for col in continuous_features:
        if col in data_encoded.columns and col != "num_outbound_cmds":
            data_encoded[col] = np.log1p(data_encoded[col])
    
    # Standardize features
    print("Standardizing features...")
    for col in continuous_features:
        if col in data_encoded.columns:
            # Simple standardization
            data_encoded[col] = (data_encoded[col] - data_encoded[col].mean()) / (data_encoded[col].std() + 1e-8)
    
    # Ensure all model features are present
    model = model_components['model']
    missing_cols = set(model.feature_names_in_) - set(data_encoded.columns)
    
    # Add missing columns
    for col in missing_cols:
        data_encoded[col] = 0
    
    # Remove extra columns
    extra_cols = set(data_encoded.columns) - set(model.feature_names_in_)
    if extra_cols:
        data_encoded = data_encoded.drop(columns=extra_cols)
    
    # Ensure columns are in the same order as during training
    data_encoded = data_encoded[model.feature_names_in_]
    
    return data_encoded

def process_log_file(file_path, model_components, output_dir=None):
    """
    Process a single log file and generate predictions
    """
    try:
        print(f"Processing file: {file_path}")
        
        # Read the CSV file
        data = pd.read_csv(file_path)
        
        # Check if data is empty
        if data.empty:
            print(f"Warning: Empty file {file_path}, skipping")
            return None
        
        # Preprocess the data
        X_processed = preprocess_data(data, model_components)
        
        # Make predictions
        model = model_components['model']
        label_encoder = model_components['label_encoder']
        
        print("Making predictions...")
        predictions = model.predict(X_processed)
        prediction_probs = model.predict_proba(X_processed)
        
        # Convert numeric predictions to category names
        predicted_categories = label_encoder.inverse_transform(predictions)
        
        # Add predictions to the data
        results = data.copy()
        results['predicted_category'] = predicted_categories
        results['prediction_code'] = predictions
        
        # Add prediction probabilities
        for i, category in enumerate(label_encoder.classes_):
            results[f'prob_{category}'] = prediction_probs[:, i]
        
        # Generate output file name
        if output_dir:
            # Create output directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)
            
            # Get the base filename without extension
            base_name = os.path.basename(file_path)
            name_without_ext = os.path.splitext(base_name)[0]
            
            # Create output file path
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = os.path.join(output_dir, f"{name_without_ext}_predictions_{timestamp}.csv")
        else:
            # Use the same directory as input file
            dir_name = os.path.dirname(file_path)
            base_name = os.path.basename(file_path)
            name_without_ext = os.path.splitext(base_name)[0]
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = os.path.join(dir_name, f"{name_without_ext}_predictions_{timestamp}.csv")
        
        # Save results
        results.to_csv(output_path, index=False)
        print(f"Predictions saved to: {output_path}")
        
        # Generate a summary
        summary = results['predicted_category'].value_counts().to_dict()
        print("\nPrediction Summary:")
        for category, count in summary.items():
            print(f"  {category}: {count} ({count/len(results)*100:.2f}%)")
        
        return output_path
        
    except Exception as e:
        print(f"Error processing file {file_path}: {str(e)}")
        return None

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Process log files using the trained model.')
    parser.add_argument('--model', type=str, default='best_model.pkl', 
                        help='Path to the pickled model file')
    parser.add_argument('--input', type=str, required=True, 
                        help='Path to input log file or directory of log files')
    parser.add_argument('--output', type=str, default=None, 
                        help='Output directory for prediction files')
    parser.add_argument('--recursive', action='store_true', 
                        help='Process files recursively if input is a directory')
    
    args = parser.parse_args()
    
    # Load the model
    model_components = load_model(args.model)
    
    # Process input (file or directory)
    if os.path.isfile(args.input):
        # Process a single file
        process_log_file(args.input, model_components, args.output)
    elif os.path.isdir(args.input):
        # Process all CSV files in the directory
        files_processed = 0
        
        if args.recursive:
            # Walk through the directory recursively
            for root, _, files in os.walk(args.input):
                for filename in files:
                    if filename.lower().endswith('.csv'):
                        file_path = os.path.join(root, filename)
                        process_log_file(file_path, model_components, args.output)
                        files_processed += 1
        else:
            # Process only files in the top directory
            for filename in os.listdir(args.input):
                if filename.lower().endswith('.csv'):
                    file_path = os.path.join(args.input, filename)
                    process_log_file(file_path, model_components, args.output)
                    files_processed += 1
        
        print(f"\nProcessed {files_processed} files")
    else:
        print(f"Error: Input path {args.input} does not exist")
        sys.exit(1)

if __name__ == "__main__":
    main() 