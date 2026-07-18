from PIL import Image
import os

SRC_DIR = 'background_animation_8frames'
OUT_DIR = 'assets/images/backgrounds'
TILES_SRC = '图/腾讯.png'
TILES_OUT = 'assets/images/tiles'
CANVAS_W = 1920
CANVAS_H = 1080

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(TILES_OUT, exist_ok=True)

frames = sorted([f for f in os.listdir(SRC_DIR) if f.endswith('.png')])
print(f'找到 {len(frames)} 帧背景')
for i, fname in enumerate(frames):
    img = Image.open(os.path.join(SRC_DIR, fname)).convert('RGBA')
    w, h = img.size
    scale = max(CANVAS_W / w, CANVAS_H / h)
    new_w = int(w * scale)
    new_h = int(h * scale)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - CANVAS_W) // 2
    top = (new_h - CANVAS_H) // 2
    img = img.crop((left, top, left + CANVAS_W, top + CANVAS_H))
    out_name = f'bg_frame_{i+1:02d}.png'
    img.save(os.path.join(OUT_DIR, out_name))
    print(f'  {out_name}: {img.size} (from {w}x{h})')

tiles = Image.open(TILES_SRC).convert('RGBA')
tiles.save(os.path.join(TILES_OUT, 'platform_tiles.png'))
print(f'瓦片集: {tiles.size} -> platform_tiles.png')
print('背景和瓦片集处理完成')
