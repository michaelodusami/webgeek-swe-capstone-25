import os

def generate_project_context(root_dir, output_file="project_context.txt",
                             ignore_dirs=None, include_extensions=None):
    """
    Generates a text file containing the project structure and content of
    specified code files.

    Args:
        root_dir (str): The root directory of your project.
        output_file (str): The name of the output text file.
        ignore_dirs (list): A list of directory names to ignore.
        include_extensions (list): A list of file extensions to include (e.g., ['.py', '.swift']).
                                   If None, all files are included (except ignored ones).
    """
    if ignore_dirs is None:
        ignore_dirs = [
            ".git", ".venv", "venv", "__pycache__", "node_modules", "build", "dist",
            ".DS_Store", ".vscode", ".idea", "bin", "obj", "DerivedData", "Pods"
        ]
    if include_extensions is None:
        # Common code file extensions for various languages
        include_extensions = [
            ".py", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".scss", ".json",
            ".xml", ".yaml", ".yml", ".md", ".txt", ".sh", ".c", ".cpp", ".h",
            ".hpp", ".java", ".go", ".rb", ".php", ".swift", ".m", ".h", ".mm",
            ".storyboard", ".xib", ".plist", ".xcassets", ".entitlements", ".gitignore",
            ".graphql", ".sql", ".kt", ".gradle", ".toml", ".ini", ".conf", ".env"
        ]

    with open(output_file, "w", encoding="utf-8") as f_out:
        f_out.write(f"--- Project Structure for: {os.path.basename(root_dir)} ---\n\n")

        for root, dirs, files in os.walk(root_dir, topdown=True):
            # Modify dirs in-place to exclude ignored directories from traversal
            dirs[:] = [d for d in dirs if d not in ignore_dirs]

            level = root.replace(root_dir, '').count(os.sep)
            indent = '    ' * level
            f_out.write(f"{indent}{os.path.basename(root)}/\n")

            sub_indent = '    ' * (level + 1)
            for file in files:
                if any(file.endswith(ext) for ext in include_extensions) and not file.startswith('.'):
                    f_out.write(f"{sub_indent}{file}\n")

        f_out.write("\n\n--- Code File Contents ---\n\n")

        for root, dirs, files in os.walk(root_dir, topdown=True):
            dirs[:] = [d for d in dirs if d not in ignore_dirs] # Ensure consistency in traversal

            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, root_dir)

                if any(file.endswith(ext) for ext in include_extensions) and not file.startswith('.'):
                    try:
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f_in:
                            content = f_in.read()
                            f_out.write(f"\n--- FILE: {relative_path} ---\n\n")
                            f_out.write(content)
                            f_out.write("\n\n")
                    except Exception as e:
                        f_out.write(f"\n--- ERROR READING FILE: {relative_path} ({e}) ---\n\n")

    print(f"Project context saved to {output_file}")

# --- How to use it ---
if __name__ == "__main__":
    # Get the directory of the script itself
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # You can specify your project root directory here.
    # For example, if your script is at the root of your project:
    project_directory = script_dir
    # Or, if your script is in a 'scripts' folder one level down:
    # project_directory = os.path.dirname(script_dir)

    # Customize ignored directories and included extensions if needed
    my_ignore_dirs = [
        ".git", ".venv", "node_modules", "build", "dist", "DerivedData",
        "Pods", "Carthage", "Fastlane", "Tests", "test" # Add Xcode specific ones
    ]
    my_include_extensions = [
        ".py", ".swift", ".h", ".m", ".mm", ".hpp", ".c", ".cpp", # C/C++/Objective-C
        ".js", ".ts", ".jsx", ".tsx", # JavaScript/TypeScript
        ".html", ".css", ".scss", ".json", ".plist", ".storyboard", ".xib", # Web/UI
        ".xml", ".yaml", ".yml", ".md", ".txt", ".sh", ".env", ".gitignore", # Config/Docs/Scripts
        ".entitlements", ".xcconfig", # Xcode specific
    ]

    generate_project_context(
        root_dir=project_directory,
        output_file="claude_project_context.txt",
        ignore_dirs=my_ignore_dirs,
        include_extensions=my_include_extensions
    )

    print(f"\nTo use with Claude, copy the content of 'claude_project_context.txt' into your prompt.")
    print("You might want to split it into chunks if it's very large, or use Claude's 'Project' feature if available.")
