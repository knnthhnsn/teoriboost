# NatkÃ¸rsel cast adjustments, executed by render.py via --adjust (scope: bpy, body, arm, mats, Vector, math, opt).
# Per character: colour correction, chunkier limbs, big expressive eyes with brows parented to the head bone.

P = {
    # eye_h: eye height as a fraction of body height; sep: half distance between eyes (m); r: eye radius (m)
    "cone":    dict(hue=0.465, sat=1.2, val=1.0, limb=0.04, eye_h=0.90, sep=0.062, r=0.058),
    "board":   dict(sat=1.1, val=1.0, limb=0.04, eye_h=0.88, sep=0.085, r=0.07),
    "turtle":  dict(sat=1.0, val=0.95, limb=0.0,  eye_h=0.93, sep=0.07,  r=0.058),
    "penguin": dict(sat=1.0, val=1.0, limb=0.0,   eye_h=0.88, sep=0.058, r=0.05),
    "trash":   dict(sat=1.1, val=1.0, limb=0.045, eye_h=0.86, sep=0.12,  r=0.085),
}
c = P[opt.get("char", "cone")]
INK = (0.03, 0.025, 0.07, 1)

# 1) Colour: boost saturation on the texture before it reaches the BSDF.
for m in mats:
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.bl_idname == "ShaderNodeBsdfPrincipled")
    link = next((l for l in nt.links if l.to_socket == bsdf.inputs["Base Color"]), None)
    if link:
        hs = nt.nodes.new("ShaderNodeHueSaturation")
        hs.inputs["Hue"].default_value = c.get("hue", 0.5); hs.inputs["Saturation"].default_value = c["sat"]; hs.inputs["Value"].default_value = c["val"]
        nt.links.new(link.from_socket, hs.inputs["Color"]); nt.links.new(hs.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.62
    bsdf.inputs["Specular IOR Level"].default_value = 0.22  # soft toy finish, no chrome look
    for n in nt.nodes:
        if n.bl_idname == "ShaderNodeTexImage" and n.image:
            n.image.colorspace_settings.name = "sRGB"

# 2) Chunkier limbs: inflate vertices weighted to arm/leg bones along their normals (in rest pose).
LIMB = ("Arm", "ForeArm", "Hand", "UpLeg", "Leg", "Foot", "Toe")
for o in body:
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.shade_smooth()
    if c["limb"] <= 0: continue
    ids = {g.index for g in o.vertex_groups if any(k in g.name for k in LIMB) and "Shoulder" not in g.name}
    vg = o.vertex_groups.new(name="nk_limbs")
    for v in o.data.vertices:
        w = min(1.0, sum(g.weight for g in v.groups if g.group in ids))
        if w > 0.01: vg.add([v.index], w, "REPLACE")
    d = o.modifiers.new("nk_inflate", "DISPLACE")
    d.strength, d.mid_level, d.direction, d.vertex_group = c["limb"], 0.0, "NORMAL", "nk_limbs"
    while o.modifiers.find("nk_inflate") > 0:
        bpy.ops.object.modifier_move_up(modifier="nk_inflate")

# 3) Eyes: raycast the posed body from the front (+Y) at eye height, place eyes on the surface.
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
zs = []
for o in body:
    ev = o.evaluated_get(dg); me = ev.to_mesh(); zs += [(ev.matrix_world @ v.co).z for v in me.vertices]; ev.to_mesh_clear()
z0, z1 = min(zs), max(zs)
ez = z0 + (z1 - z0) * c["eye_h"]
head = arm.pose.bones.get("mixamorig:Head")

def mat(name, color, rough=0.35, emit=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = color; b.inputs["Roughness"].default_value = rough
    if emit: b.inputs["Emission Color"].default_value = color; b.inputs["Emission Strength"].default_value = emit
    return m
white, ink, shine = mat("nk_eye", (0.97, 0.96, 0.94, 1), 0.25), mat("nk_pupil", INK, 0.15), mat("nk_shine", (1, 1, 1, 1), 0.1, 4.0)

def sphere(name, loc, r, m, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=r, location=loc)
    s = bpy.context.object; s.name = name; s.scale = scale; s.data.materials.append(m)
    bpy.ops.object.shade_smooth(); return s

parts = []
for side in (-1, 1):
    x = side * c["sep"]
    hit, loc, nrm, *_ = bpy.context.scene.ray_cast(dg, Vector((x, 10, ez)), Vector((0, -1, 0)))
    if not hit:
        loc, nrm = Vector((x, 0.2, ez)), Vector((0, 1, 0))
    r = c["r"]
    centre = loc + Vector((0, 1, 0)) * r * 0.35
    eye = sphere(f"nk_eye_{side}", centre, r, white, (1, 0.55, 1.12))
    pupil = sphere(f"nk_pupil_{side}", centre + Vector((-side * r * 0.08, r * 0.5, -r * 0.05)), r * 0.52, ink, (1, 0.5, 1.1))
    hl = sphere(f"nk_shine_{side}", centre + Vector((-side * r * 0.05 + r * 0.2, r * 0.82, r * 0.3)), r * 0.16, shine)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r * 0.11, depth=r * 1.15,
                                        location=centre + Vector((0, r * 0.25, r * 1.5)))
    brow = bpy.context.object; brow.name = f"nk_brow_{side}"
    # Inner ends slightly raised: friendly, attentive (not angry).
    brow.rotation_euler = (0, math.radians(90 - side * 10), 0); brow.data.materials.append(ink)
    bev = brow.modifiers.new("round", "BEVEL"); bev.width = r * 0.14; bev.segments = 6
    bpy.ops.object.shade_smooth()
    parts += [eye, pupil, hl, brow]

# Parent the face parts to the head bone so they follow animation.
for p in parts:
    if head:
        mw = p.matrix_world.copy()
        p.parent, p.parent_type, p.parent_bone = arm, "BONE", head.name
        p.matrix_world = mw

