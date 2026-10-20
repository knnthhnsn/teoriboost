"""Blender: import a 100Avatars VRM (Mixamo rig), pose it, light it and render a hero shot.

blender -b --factory-startup -P render.py -- <model.vrm> <out.png> [--angle 30] [--size 1024]
    [--armdown 70] [--axis Z] [--samples 128] [--adjust adjust.py]

Renders with a transparent film + shadow catcher; composite onto a background afterwards.
--adjust runs a per-character script (with `bpy`, `body`, `arm`, `mats` in scope) before rendering.
"""
import bpy, sys, math, os, shutil, tempfile
from mathutils import Vector, Euler

argv = sys.argv[sys.argv.index("--") + 1:]
src, out = argv[0], argv[1]
opt = {argv[i][2:]: argv[i + 1] for i in range(2, len(argv) - 1, 2) if argv[i].startswith("--")}
angle, size = float(opt.get("angle", 30)), int(opt.get("size", 1024))

bpy.ops.wm.read_factory_settings(use_empty=True)
tmp = os.path.join(tempfile.gettempdir(), "nk_import.glb"); shutil.copy(src, tmp)
bpy.ops.import_scene.gltf(filepath=tmp)
scene = bpy.context.scene

# Remove helper geometry that isn't part of the skinned character.
for o in list(scene.objects):
    if o.type == "MESH" and o.parent is None:
        bpy.data.objects.remove(o, do_unlink=True)
arm = next(o for o in scene.objects if o.type == "ARMATURE")
body = [o for o in scene.objects if o.type == "MESH"]

# Unlit (emission) VRM materials -> soft lit Principled BSDF using the same texture.
mats = []
for o in body:
    for s in o.material_slots:
        m = s.material
        if not m or m in mats: continue
        mats.append(m)
        nt = m.node_tree
        tex = next((n for n in nt.nodes if n.bl_idname == "ShaderNodeTexImage"), None)
        outn = next(n for n in nt.nodes if n.bl_idname == "ShaderNodeOutputMaterial")
        bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
        bsdf.inputs["Roughness"].default_value = 0.55
        if tex:
            nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
            nt.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
        nt.links.new(bsdf.outputs["BSDF"], outn.inputs["Surface"])

# Relaxed pose: arms down from the T-pose.
down = math.radians(float(opt.get("armdown", 70))); axis = opt.get("axis", "Z")
for side, sign in (("Left", 1), ("Right", -1)):
    pb = arm.pose.bones.get(f"mixamorig:{side}Arm")
    if pb:
        pb.rotation_mode = "XYZ"
        e = [0.0, 0.0, 0.0]; e["XYZ".index(axis)] = sign * down
        pb.rotation_euler = Euler(e)

if "adjust" in opt:
    exec(open(opt["adjust"], encoding="utf-8-sig").read(), {"bpy": bpy, "body": body, "arm": arm, "mats": mats, "Vector": Vector, "math": math, "opt": opt})

bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get()
pts = []
# --frame body: ignore arm/hand vertices so every pose of a character gets identical framing.
arm_only = opt.get("frame") == "body"
for o in [o for o in scene.objects if o.type == "MESH"]:
    arm_ids = {g.index for g in o.vertex_groups if any(k in g.name for k in ("Arm", "Hand"))} if arm_only else set()
    ev = o.evaluated_get(dg); me = ev.to_mesh()
    for v, src_v in zip(me.vertices, o.data.vertices):
        if arm_ids and sum(g.weight for g in src_v.groups if g.group in arm_ids) > 0.5:
            continue
        pts.append(ev.matrix_world @ v.co)
    ev.to_mesh_clear()
lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
center, dims = (lo + hi) / 2, hi - lo
H = max(dims)

scene.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
for dev_type in ("OPTIX", "CUDA"):
    try:
        prefs.compute_device_type = dev_type; prefs.get_devices()
        if any(d.type == dev_type for d in prefs.devices):
            for d in prefs.devices: d.use = d.type == dev_type
            scene.cycles.device = "GPU"; break
    except TypeError:
        pass
scene.cycles.samples = int(opt.get("samples", 128)); scene.cycles.use_denoising = True
scene.render.resolution_x = scene.render.resolution_y = size
scene.render.film_transparent = True
scene.view_settings.view_transform = "Standard"  # keep texture colours true (AgX washed them out)
world = bpy.data.worlds.new("w"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.95, 0.93, 0.9, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.45

bpy.ops.mesh.primitive_plane_add(size=H * 20, location=(center.x, center.y, lo.z))
bpy.context.object.is_shadow_catcher = True

def area(loc, energy, sz, color=(1, 1, 1)):
    bpy.ops.object.light_add(type="AREA", location=loc); l = bpy.context.object
    l.data.energy, l.data.size, l.data.color = energy, sz, color
    l.rotation_euler = (center - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
# Characters face +Y after import; light and shoot from that side.
area(center + Vector((-1.4 * H, 1.6 * H, 1.8 * H)), 260 * H * H, 1.8 * H, (1.0, 0.96, 0.9))
area(center + Vector((1.8 * H, 1.0 * H, 0.5 * H)), 90 * H * H, 2.6 * H, (0.9, 0.94, 1.0))
area(center + Vector((0.6 * H, -1.8 * H, 1.6 * H)), 200 * H * H, 1.2 * H)

bpy.ops.object.camera_add(); cam = bpy.context.object; scene.camera = cam
cam.data.lens = 50
fov = cam.data.angle
a = math.radians(angle)
fit = max(dims.z, (dims.x ** 2 + dims.y ** 2) ** 0.5 * 0.9) * 1.18
dist = fit / 2 / math.tan(fov / 2)
cam.location = center + Vector((math.sin(a) * dist, math.cos(a) * dist, dims.z * 0.18))
cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()

scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print("RENDERED", out, "dims", [round(v, 2) for v in dims])

