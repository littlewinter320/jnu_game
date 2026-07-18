from PIL import Image
import numpy as np
from collections import deque
import os

def flood_remove_white_bg(img, threshold=245):
    img = img.convert('RGBA')
    arr = np.array(img)
    h, w = arr.shape[:2]
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]
    visited = np.zeros((h, w), dtype=bool)
    to_remove = np.zeros((h, w), dtype=bool)
    def is_bg(y, x):
        if y < 0 or y >= h or x < 0 or x >= w: return False
        if visited[y, x]: return False
        return (r[y,x] > threshold and g[y,x] > threshold and b[y,x] > threshold)
    q = deque()
    for x in range(w):
        if is_bg(0, x): q.append((0, x))
        if is_bg(h-1, x): q.append((h-1, x))
    for y in range(h):
        if is_bg(y, 0): q.append((y, 0))
        if is_bg(y, w-1): q.append((y, w-1))
    while q:
        y, x = q.popleft()
        if visited[y, x]: continue
        visited[y, x] = True
        to_remove[y, x] = True
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
            ny, nx = y+dy, x+dx
            if is_bg(ny, nx): q.append((ny, nx))
    arr[to_remove, 3] = 0
    for dy in range(-2, 3):
        for dx in range(-2, 3):
            if dy == 0 and dx == 0: continue
            shifted = np.zeros_like(to_remove)
            sy0, sy1 = max(0,-dy), min(h, h-dy)
            sx0, sx1 = max(0,-dx), min(w, w-dx)
            dy0, dy1 = max(0,dy), min(h, h+dy)
            dx0, dx1 = max(0,dx), min(w, w+dx)
            shifted[sy0:sy1, sx0:sx1] = to_remove[dy0:dy1, dx0:dx1]
            edge = shifted & ~to_remove & (r > 230) & (g > 230) & (b > 230)
            arr[edge, 3] = np.minimum(arr[edge, 3], 120)
    return Image.fromarray(arr)

def auto_crop(img, pad=2):
    arr = np.array(img.convert('RGBA'))
    alpha = arr[:,:,3]
    mask = alpha > 20
    if not mask.any(): return img
    rows = np.any(mask, axis=1)
    cols = np.any(mask, axis=0)
    y1, y2 = np.where(rows)[0][[0,-1]]
    x1, x2 = np.where(cols)[0][[0,-1]]
    return img.crop((max(0,x1-pad), max(0,y1-pad), min(img.width,x2+pad+1), min(img.height,y2+pad+1)))

src_dir = '图'
out_dir = 'assets/images/ui'
os.makedirs(out_dir, exist_ok=True)

mapping = {
    'logo.jpg': ('logo.png', 800),
    '开始.jpg': ('btn_start.png', 400),
    '结束.jpg': ('btn_end.png', 400),
    '操作说明.jpg': ('btn_help.png', 400),
    '制作人员.jpg': ('btn_credits.png', 400),
    '设置.jpg': ('btn_settings.png', 200),
}

for src_name, (out_name, target_w) in mapping.items():
    src = os.path.join(src_dir, src_name)
    dst = os.path.join(out_dir, out_name)
    img = Image.open(src)
    img = flood_remove_white_bg(img)
    img = auto_crop(img)
    w, h = img.size
    scale = target_w / w
    new_h = int(h * scale)
    img = img.resize((target_w, new_h), Image.LANCZOS)
    img.save(dst)
    print(f'{out_name}: {img.size}')
print('UI素材处理完成')
