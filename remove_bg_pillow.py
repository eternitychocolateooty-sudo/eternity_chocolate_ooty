import sys
from PIL import Image

def remove_white_bg(input_path, output_path, threshold=240):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # change all white (also shades of whites)
        # pixels to transparent
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        remove_white_bg(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python remove_bg_pillow.py <input> <output>")
