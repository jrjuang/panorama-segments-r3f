import OpenEXR
import Imath
import numpy as np
from PIL import Image
import os

def exr_to_png(exr_file, png_file):
    """
    Convert an EXR image file to PNG format.
    
    Args:
        exr_file (str): Path to input EXR file
        png_file (str): Path to output PNG file
    
    Returns:
        bool: True if conversion was successful, False otherwise
    """
    try:
        # Check if input file exists
        if not os.path.exists(exr_file):
            raise FileNotFoundError(f"Input file {exr_file} does not exist")

        # Open EXR file
        exr = OpenEXR.InputFile(exr_file)
        
        # Get data window
        dw = exr.header()['dataWindow']
        width = dw.max.x - dw.min.x + 1
        height = dw.max.y - dw.min.y + 1

        # Get pixel type (assuming FLOAT for all channels)
        FLOAT = Imath.PixelType(Imath.PixelType.FLOAT)
        
        # Read all RGB channels
        channels = exr.channels(['R', 'G', 'B'], FLOAT)
        
        # Convert to numpy arrays
        rgb = [np.frombuffer(channel, dtype=np.float32) for channel in channels]
        
        # Reshape and stack channels
        rgb = [channel.reshape(height, width) for channel in rgb]
        img = np.stack(rgb, axis=-1)
        
        # Tone mapping: simple exposure and gamma correction
        # You can adjust these values based on your needs
        exposure = 1.0
        gamma = 2.2
        
        img = img * exposure
        img = np.power(np.clip(img, 0, 1), 1/gamma)
        
        # Convert to 8-bit
        img = (img * 255).astype(np.uint8)
        
        # Create PIL Image and save
        Image.fromarray(img).save(png_file)
        
        return True
        
    except Exception as e:
        print(f"Error converting {exr_file} to PNG: {str(e)}")
        return False

def main():
    """
    Example usage of the converter
    """
    import sys
    
    if len(sys.argv) != 3:
        print("Usage: python script.py input.exr output.png")
        return
        
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    success = exr_to_png(input_file, output_file)
    if success:
        print(f"Successfully converted {input_file} to {output_file}")
    else:
        print("Conversion failed")

if __name__ == "__main__":
    main()
