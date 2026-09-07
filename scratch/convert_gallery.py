import os
from PIL import Image

src_dir = r"C:\Users\Muzammil\Desktop\eternity"
dest_dir = r"d:\ooty-chocolate-tales-main-main\src\assets"

files = sorted([f for f in os.listdir(src_dir) if f.lower().endswith(('.jpeg', '.jpg', '.png'))])

print(f"Found {len(files)} files to convert.")

for idx, filename in enumerate(files, 1):
    src_path = os.path.join(src_dir, filename)
    dest_filename = f"gallery-{idx}.webp"
    dest_path = os.path.join(dest_dir, dest_filename)
    
    with Image.open(src_path) as img:
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(dest_path, "WEBP", quality=84, method=6)
        print(f"[{idx}/17] {filename} -> {dest_filename} ({img.width}x{img.height})")

print("Conversion complete!")
