# Natkørsel cast (based on 100Avatars)

Source models: Cool Cone (169), Cool Board (170), Cool Turtle (182), Chill Penguin (160) and Cool Trash (146)
from **100Avatars R2 by Polygonal Mind**, via Open Source Avatars (opensourceavatars.com). License: **CC0**
(commercial use and modification allowed, no attribution required; credited here anyway).

- `source/*.vrm`: original VRM 0.x files (glTF binary, Mixamo rig, 16 shape keys).
- `render.py`: Blender 5.1 render (Cycles GPU, shadow catcher, arms-down pose).
- `adjust.py`: Natkørsel adjustments: true colours, matte toy materials, thicker limbs, 3D eyes and brows
  parented to the head bone.
- `renders/`: hero renders (`*-v3.png` transparent, `*-v3-bg.png` on cream) and `before-after.jpg`.

Render one character:

```
blender -b --factory-startup -P render.py -- source/cone.vrm renders/cone-v3.png --axis Z --armdown 75 --angle 20 --adjust adjust.py --char cone
```
