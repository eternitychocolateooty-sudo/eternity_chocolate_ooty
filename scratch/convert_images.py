import os
from PIL import Image

assets_dir = r"d:\ooty-chocolate-tales-main-main\src\assets"

total_original = 0
total_webp = 0

for filename in os.listdir(assets_dir):
    if filename.endswith(".jpg"):
        jpg_path = os.path.join(assets_dir, filename)
        webp_filename = filename.replace(".jpg", ".webp")
        webp_path = os.path.join(assets_dir, webp_filename)
        
        orig_size = os.path.getsize(jpg_path)
        total_original += orig_size
        
        with Image.open(jpg_path) as img:
            # Resize if dimensions are excessively large for web display (> 1600px width)
            if img.width > 1600:
                new_height = int(img.height * (1600 / img.width))
                img = img.resize((1600, new_height), Image.Resampling.LANCZOS)
            
            img.save(webp_path, "WEBP", quality=82, method=6)
        
        new_size = os.path.getsize(webp_path)
        total_webp += new_size
        print(f"Converted {filename} ({orig_size//1024} KB) -> {webp_filename} ({new_size//1024} KB) [{round((1 - new_size/orig_size)*100, 1)}% saved]")

print(f"\nTOTAL SAVED: {total_original//1024} KB -> {total_webp//1024} KB ({round((1 - total_webp/total_original)*100, 1)}% reduction!)")
