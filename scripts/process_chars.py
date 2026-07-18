from PIL import Image
import numpy as np
import json, os

def process(src_path, out_png, out_meta, prefix, frames_list):
    img = Image.open(src_path).convert('RGBA')
    arr = np.array(img)
    r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]

    white_mask = (r > 245) & (g > 245) & (b > 245)
    arr[white_mask, 3] = 0
    img = Image.fromarray(arr)

    ar2 = np.array(img)
    alpha2 = ar2[:,:,3]
    col_has = np.any(alpha2 > 20, axis=0)
    xs = np.where(col_has)[0]
    x0 = 0
    if len(xs) > 0:
        for i in range(len(xs)-1):
            if xs[i+1] - xs[i] > 30:
                x0 = xs[i+1]
                break
        else:
            x0 = max(0, xs[0])
    img = img.crop((x0, 0, img.width, img.height))

    ar3 = np.array(img)
    alpha3 = ar3[:,:,3]
    mask3 = alpha3 > 20
    rows = np.any(mask3, axis=1)
    cols = np.any(mask3, axis=0)
    y1, y2 = np.where(rows)[0][[0,-1]]
    x1, x2 = np.where(cols)[0][[0,-1]]
    img = img.crop((max(0,x1-4), max(0,y1-4), min(img.width,x2+5), min(img.height,y2+5)))

    os.makedirs(os.path.dirname(out_png), exist_ok=True)
    img.save(out_png)

    w, h = img.size
    n_rows = len(ANIM_NAMES)
    row_h = h / n_rows
    starts = [int(i * row_h) for i in range(n_rows)]

    meta = {"spriteSheet": os.path.basename(out_png), "frameWidth": FW, "frameHeight": FRAME_H, "animations": {}}
    for i, name in enumerate(ANIM_NAMES):
        meta["animations"][f'{prefix}_{name}'] = {
            "row": i, "y": starts[i], "frames": frames_list[i],
            "frameWidth": FW, "frameHeight": FRAME_H
        }
    with open(out_meta, 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print(f'{prefix}: sheet={w}x{h}, row_h={row_h:.1f}, starts={starts[:3]}...')

FW = 80
FRAME_H = 72
ANIM_NAMES = [
    'idle','run_left','run_right','jump','airborne','landing',
    'crouch','crouch_walk','hurt','knockback','death','pickup','operate','victory'
]
M_FRAMES = [4,4,4,4,4,4,4,4,5,4,5,4,4,4]
F_FRAMES = [4,4,4,4,4,3,4,4,4,4,4,3,4,4]

process('图/男.jpg', 'assets/images/characters/male_spritesheet.png',
        'assets/images/characters/male_anims.json', 'male', M_FRAMES)
process('图/女.png', 'assets/images/characters/female_spritesheet.png',
        'assets/images/characters/female_anims.json', 'female', F_FRAMES)
print('角色处理完成')
