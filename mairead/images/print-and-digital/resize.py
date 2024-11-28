from PIL import Image
import os

# Set base width for resizing
base_width = 1024

# Loop through image names slideshow-1.jpg to slideshow-7.jpg
for i in range(1, 8):
    img_name = f'slideshow-{i}.jpg'
    if os.path.exists(img_name):  # Check if the file exists
        img = Image.open(img_name)
        wpercent = (base_width / float(img.size[0]))
        hsize = int((float(img.size[1]) * float(wpercent)))
        img = img.resize((base_width, hsize), Image.Resampling.LANCZOS)
        img.save(img_name)
        print(f"Resized and saved: {img_name}")
    else:
        print(f"File not found: {img_name}")
