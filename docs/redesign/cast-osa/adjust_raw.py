# Natkørsel cast, "almost raw": original geometry, faces and texture colours untouched.
# Only a soft matte material response and a character pose. Executed by render.py via --adjust.
# Mixamo bones: rotating an arm bone around local Z swings it up/down in the frontal plane.
# Left side: +Z lowers the arm; right side: -Z lowers it. Values are degrees (X, Y, Z).

POSES = {
    "cone": {  # friendly wave
        "LeftArm": (0, 0, 72), "LeftForeArm": (0, 0, 10),
        "RightArm": (0, 0, 10), "RightForeArm": (0, 0, 95), "Head": (0, 0, -8),
    },
    "board": {  # relaxed lean
        "LeftArm": (0, 0, 70), "RightArm": (0, 0, -66), "RightForeArm": (0, 0, -20),
        "Spine": (0, 0, 6), "Head": (0, 0, -7),
    },
    "turtle": {  # hands on hips
        "LeftArm": (0, 0, 48), "LeftForeArm": (0, 0, 105),
        "RightArm": (0, 0, -48), "RightForeArm": (0, 0, -105), "Head": (0, 0, 6),
    },
    "penguin": {  # chill: one hand on hip, head tilted
        "LeftArm": (0, 0, 70), "LeftForeArm": (0, 0, 8),
        "RightArm": (0, 0, -48), "RightForeArm": (0, 0, -105), "Head": (0, 0, 9),
    },
    "trash": {  # cheering
        "LeftArm": (0, 0, -35), "LeftForeArm": (0, 0, -30),
        "RightArm": (0, 0, 35), "RightForeArm": (0, 0, 30), "Head": (0, 0, 0),
    },
}

for m in mats:
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.65
    bsdf.inputs["Specular IOR Level"].default_value = 0.2
    for n in nt.nodes:
        if n.bl_idname == "ShaderNodeTexImage" and n.image:
            n.image.colorspace_settings.name = "sRGB"

for o in body:
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.shade_smooth()

for bone, (x, y, z) in POSES[opt.get("char", "cone")].items():
    pb = arm.pose.bones.get("mixamorig:" + bone)
    if pb:
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (math.radians(x), math.radians(y), math.radians(z))
