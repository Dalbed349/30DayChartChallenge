
import os
from kaggle.api.kaggle_api_extended import KaggleApi # Correct import

# --- Configuration ---
dataset_id = 'atharvasoundankar/global-cybersecurity-threats-2015-2024'
# Define path relative to where the script is run, or use absolute paths
download_path = '.'

# --- Main script ---
if __name__ == "__main__":
    print(f"Attempting to download dataset: {dataset_id}")
    print(f"Target directory: {download_path}")

    # Ensure the download directory exists
    try:
        os.makedirs(download_path, exist_ok=True)
        print(f"Directory '{download_path}' checked/created.")
    except OSError as e:
        print(f"Error creating directory {download_path}: {e}")
        exit(1) # Exit if directory creation fails

    try:
        # Initialize Kaggle API client (authenticates using ~/.kaggle/kaggle.json)
        api = KaggleApi()
        api.authenticate()
        print("Kaggle API authenticated successfully.")

        # Download dataset files
        print("Starting dataset download (this may take a while)...")
        api.dataset_download_files(
            dataset_id,
            path=download_path,
            unzip=True # Automatically unzip after download
            # force=False # Set to True to overwrite existing files
            # quiet=False # Set to True to suppress download progress output
        )
        print("Dataset downloaded and extracted successfully!")

    except Exception as e:
        print(f"\nAn error occurred: {e}")
        print("Please ensure:")
        print("1. The 'kaggle' Python library is installed (`pip install kaggle`).")
        print("2. Your Kaggle API credentials (`kaggle.json`) are correctly placed.")
        print(f"   (Typically ~/.kaggle/kaggle.json or C:\\Users\\<User>\\.kaggle\\kaggle.json)")
        print(f"3. The dataset identifier '{dataset_id}' is correct.")
        print("4. You have accepted any rules for this dataset on the Kaggle website.")
        exit(1)

    print("Python script finished.")