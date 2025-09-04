import os

# --- Configuration ---
output_file_name = "project_context.txt"  # Name of the output file
# Use os.getcwd() for the current directory, or specify a path like "/path/to/your/project"
directory_path = os.getcwd()
excluded_directories = {".git", "__pycache__", ".vscode", ".idea", ".DS_Store", "node_modules", "build", "dist"} # Directories to ignore
excluded_file_extensions = {
    "png", "jpg", "jpeg", "gif", "ico", "svg", "pdf", "zip", "tar", "gz", "rar",
    "bin", "dylib", "so", "o", "a", "pyc", "DS_Store",  # Binary/compiled files
    "log", "tmp"  # Common temporary/log files
} # File extensions to ignore (binary, image, compressed files)

# --- Main Logic ---
def generate_directory_context(path: str, output_file: str):
    """
    Scans the specified directory, collects file paths and contents,
    and writes them to an output file.
    """
    output_content = []
    print(f"Starting to scan directory: {path}")
    print(f"Output will be saved to: {output_file}")

    for root, dirs, files in os.walk(path, topdown=True):
        # Modify dirs in-place to exclude unwanted directories from being walked
        dirs[:] = [d for d in dirs if d not in excluded_directories]

        relative_root = os.path.relpath(root, path)
        if relative_root == ".":
            relative_root = "" # Handle the root directory itself

        # Add directory title
        if relative_root: # Don't add for the base directory unless it's a specific sub-dir
            output_content.append(f"--- Directory: {relative_root} ---")
            output_content.append("[DIRECTORY]\n")


        for file_name in files:
            file_extension = file_name.split('.')[-1].lower() if '.' in file_name else ''
            if file_extension in excluded_file_extensions:
                print(f"Skipping file (excluded extension): {os.path.join(relative_root, file_name)}")
                continue

            file_path = os.path.join(root, file_name)
            relative_file_path = os.path.join(relative_root, file_name)

            output_content.append(f"--- File: {relative_file_path} ---")
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    output_content.append(content)
                print(f"Processing file: {relative_file_path}")
            except Exception as e:
                output_content.append(f"[COULD NOT READ FILE CONTENT: {e}]")
                print(f"Error reading file {relative_file_path}: {e}")
            output_content.append("\n") # Add a newline for separation

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("\n".join(output_content))
        print(f"\nSuccessfully generated project context to {output_file}")
    except Exception as e:
        print(f"Error writing to output file {output_file}: {e}")

# --- Execution ---
if __name__ == "__main__":
    generate_directory_context(directory_path, output_file_name)