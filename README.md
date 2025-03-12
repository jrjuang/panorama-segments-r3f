This is an experimental Three.js lab built on R3F. It enables hoverable objects in a panorama by leveraging segmentation results from Meta's Segment Anything Model (SAM): [GitHub Repository](https://github.com/facebookresearch/segment-anything).  

## Installation (Windows CMD)  
```bash
gh repo clone jrjuang/panorama-segments-r3f
cd panorama-segments-r3f
npm install
npm run dev
```

## Usage  
- **Mouse hover**: Highlight objects segmented in the panorama.
- **Click on a door**: Switch to a different room.
- **Right mouse button**: Drag to look around the scene.
- **Mouse wheel**: Zoom in or out. 
- **F2 Key**: Cycle through rooms.
- **First-time loading when switching rooms may be slow; please wait about 5 seconds.**

![Demo](demo.gif)
