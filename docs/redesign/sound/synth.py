"""TeoriBoost sound set: every cue is designed and rendered here, from scratch.

Palette: a bright toy-garage world in D major. Felt-mallet marimba and kalimba
(modal synthesis), glassy FM bells for rewards, Karplus-Strong plucks for warmth,
and synthesized foley for Min bil (spray can, ratchet, impact wrench, neon, air
suspension, stamp, four engines). A short synthetic room glues it together.

Mastering: each cue is loudness-matched by category (UI quiet, feedback medium,
celebrations loud), true-peak limited to -1 dBFS, faded, and encoded as mono MP3.
Run:  python synth.py  ->  dist/assets/sfx/*.mp3 + docs/redesign/sound/*.png sheets
"""
import json, os, subprocess, sys
import numpy as np
from scipy import signal

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(ROOT, 'dist', 'assets', 'sfx')
WAV = os.path.join(HERE, 'wav')
rng = np.random.default_rng(7)

# ---------- tuning ----------
A4 = 440.0
NOTES = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
def hz(name):
    n, o = name[:-1], int(name[-1])
    return A4 * 2 ** ((NOTES[n] + 12 * (o - 4)) / 12)

def t_axis(dur): return np.arange(int(dur * SR)) / SR
def silence(dur): return np.zeros(int(dur * SR))

def place(buf, snd, at):
    i = int(at * SR); end = min(len(buf), i + len(snd))
    s = snd[:end - i].copy()
    fl = min(len(s), int(0.012 * SR))  # never stop a ringing note dead: that is a click
    if fl > 1: s[-fl:] *= np.cos(np.linspace(0, np.pi / 2, fl)) ** 2
    buf[i:end] += s
    return buf

def mix(dur, *items):
    out = silence(dur)
    for at, snd, gain in items: place(out, snd * gain, at)
    return out

def lp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, order=2): return signal.sosfilt(signal.butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)

def peak_eq(x, f, q, gain_db):
    a = 10 ** (gain_db / 40); w = 2 * np.pi * f / SR; al = np.sin(w) / (2 * q)
    b = [1 + al * a, -2 * np.cos(w), 1 - al * a]; d = [1 + al / a, -2 * np.cos(w), 1 - al / a]
    return signal.lfilter(np.array(b) / d[0], np.array(d) / d[0], x)

def resonator(x, f, q):
    """A two-pole resonant bandpass; the body of anything that rings."""
    w = 2 * np.pi * f / SR; r = np.exp(-w / (2 * q))
    return signal.lfilter([1 - r], [1, -2 * r * np.cos(w), r * r], x)

def noise(dur): return rng.standard_normal(int(dur * SR))

def env_exp(dur, decay, attack=0.002):
    t = t_axis(dur); e = np.exp(-t / decay)
    a = int(attack * SR)
    if a > 1: e[:a] *= np.linspace(0, 1, a) ** 0.7
    return e

# ---------- instruments ----------
def mallet(f, dur=0.6, hard=0.5, decay=0.35, bright=1.0):
    """Felt-mallet marimba bar: tuned partials 1 : 3.93 : 9.24 that die faster as they rise,
    a tube resonance under the fundamental, and a short mallet 'tock'."""
    t = t_axis(dur); out = np.zeros_like(t)
    for ratio, amp, dk in [(1, 1.0, 1.0), (3.93, 0.32 * bright, 0.28), (9.24, 0.10 * bright * hard, 0.10), (2.0, 0.06, 0.5)]:
        if f * ratio > SR / 2.2: continue
        out += amp * np.sin(2 * np.pi * f * ratio * t + rng.uniform(0, 6.28)) * np.exp(-t / (decay * dk))
    a = int(0.0015 * SR); out[:a] *= np.linspace(0, 1, a)
    tock = lp(noise(0.012), 1800 + 3500 * hard) * env_exp(0.012, 0.0025, 0.0003)
    out[:len(tock)] += tock * 0.35 * hard
    return out

def kalimba(f, dur=0.8, decay=0.45):
    t = t_axis(dur); out = np.zeros_like(t)
    for ratio, amp, dk in [(1, 1.0, 1.0), (5.4, 0.22, 0.18), (9.6, 0.07, 0.08)]:
        if f * ratio > SR / 2.2: continue
        out += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t / (decay * dk))
    a = int(0.001 * SR); out[:a] *= np.linspace(0, 1, a)
    out[:int(0.006 * SR)] += hp(noise(0.006), 3000) * env_exp(0.006, 0.0015, 0.0002) * 0.2
    return out

def bell(f, dur=1.2, decay=0.5, index=2.2, ratio=3.5):
    """Glassy FM bell: inharmonic modulator whose index falls with time (bright strike, pure tail)."""
    t = t_axis(dur); ie = index * np.exp(-t / (decay * 0.35))
    mod = np.sin(2 * np.pi * f * ratio * t) * ie
    out = np.sin(2 * np.pi * f * t + mod) * env_exp(dur, decay, 0.001)
    out += 0.25 * np.sin(2 * np.pi * f * 2.76 * t) * env_exp(dur, decay * 0.3, 0.001)
    return out

def pluck(f, dur=0.7, damp=0.996, bright=0.5):
    """Karplus-Strong string: a noise burst circulating in a tuned, gently damped delay line."""
    n = int(dur * SR); p = max(2, int(round(SR / f)))
    buf = lp(rng.uniform(-1, 1, p), 1500 + 9000 * bright, 1)
    out = np.zeros(n)
    for i in range(n):
        v = buf[i % p]; out[i] = v
        buf[i % p] = damp * 0.5 * (v + buf[(i + 1) % p])
    return out

def click(freq=4200, dur=0.006, q=3):
    x = noise(dur) * env_exp(dur, dur / 4, 0.0002)
    return resonator(x, freq, q) * 3

def thump(f0=170, f1=70, dur=0.09, decay=0.035):
    """Tactile low pop: a sine whose pitch drops fast. Felt more than heard on phones."""
    t = t_axis(dur); f = f1 + (f0 - f1) * np.exp(-t / 0.015)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(dur, decay, 0.001)

def sweep_noise(dur, f0, f1, q=2.0, shape=None):
    """Noise through a resonant bandpass whose centre glides f0 -> f1 (whoosh, spray, air)."""
    x = noise(dur); n = len(x); out = np.zeros(n)
    fc = np.geomspace(f0, f1, n)
    y1 = y2 = 0.0
    for i in range(0, n, 32):  # update the filter every 32 samples
        w = 2 * np.pi * fc[i] / SR; r = np.exp(-w / (2 * q)); c = 2 * r * np.cos(w); g = 1 - r
        for j in range(i, min(n, i + 32)):
            y = g * x[j] + c * y1 - r * r * y2; y2 = y1; y1 = y; out[j] = y
    if shape is not None: out *= shape
    return out

def room(x, size=0.32, wet=0.16, tone=6000):
    """Short synthetic room: exponentially decaying, darkening noise impulse response."""
    t = t_axis(size)
    ir = noise(size) * np.exp(-t / (size / 5))
    ir = lp(ir, tone); ir[0] = 0
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    early = np.zeros(int(0.03 * SR)); early[[int(0.011 * SR), int(0.019 * SR), int(0.027 * SR)]] = [0.5, 0.35, 0.25]
    ir[:len(early)] += early * 0.2
    w = signal.fftconvolve(x, ir)[:len(x) + len(ir) - 1]
    dry = np.concatenate([x, np.zeros(len(w) - len(x))])
    return dry * (1 - wet * 0.4) + w * wet

def tail(x, sec=0.25): return np.concatenate([x, np.zeros(int(sec * SR))])

# ---------- engines ----------
def engine(rpm_curve, cylinders, dur, bright, rasp, burble=0.0, pipe=(110, 420, 1600), turbo=0.0, pops=0):
    """Firing pulses at rpm*cyl/120 Hz, each a short combustion grain, through exhaust resonances.
    burble: uneven V8 firing; turbo: whistle that follows boost; pops: overrun crackles."""
    n = int(dur * SR); t = np.arange(n) / SR
    rpm = np.interp(t, *zip(*rpm_curve))
    fire = rpm * cylinders / 120.0
    phase = np.cumsum(fire) / SR
    idx = np.nonzero(np.diff(np.floor(phase)) > 0)[0]
    exc = np.zeros(n)
    pattern = np.array([1.0, 0.62, 0.9, 0.55, 1.0, 0.7, 0.58, 0.95]) if burble else np.ones(8)
    gl = int(0.006 * SR); k_ = np.arange(gl)
    # each firing: a sharp pressure crack (broadband) plus a short raspy noise tail
    grain = np.exp(-k_ / (0.00035 * SR)) + rasp * 0.5 * rng.standard_normal(gl) * np.exp(-k_ / (0.0018 * SR))
    for k, i in enumerate(idx):
        a = pattern[k % 8] * (1 + 0.08 * rng.standard_normal())
        e = min(n, i + gl); exc[i:e] += a * grain[:e - i]
    throttle = np.clip((rpm - rpm.min()) / (np.ptp(rpm) + 1e-9), 0, 1)
    body = sum(resonator(exc, f, q) * g for f, q, g in [(pipe[0], 3, 1.2), (pipe[1], 4, 0.8), (pipe[2], 5, 0.35 * bright)])
    body = body + hp(exc, 900) * 0.25 * bright * (0.4 + throttle)
    # brighter (open) when on throttle, darker at idle
    dark = lp(body, 900); body = dark + (body - dark) * (0.35 + 0.65 * throttle)
    intake = bp(noise(dur), 600, 3000) * 0.05 * throttle
    out = body + intake
    # Phones cannot play the fundamental, so let the exhaust distort a little: tube-like saturation
    # puts its growl into 300-3000 Hz where a small speaker still speaks, and the ear fills in the low end.
    out = out / (np.max(np.abs(out)) + 1e-9)
    out = np.tanh(out * (2.2 + 2.5 * throttle)) * 0.6 + out * 0.4
    out = peak_eq(out, 900, 0.9, 4); out = peak_eq(out, 2200, 1.2, 2)
    # Tame the pipe boom (it eats all the loudness and phones drop it anyway), lift the growl band
    out = out - lp(out, 260, 2) * 0.8
    out = peak_eq(out, 600, 0.8, 5); out = peak_eq(out, 1500, 1.0, 6); out = peak_eq(out, 3200, 1.5, 3 * bright)
    if turbo:
        boost = np.convolve(throttle, np.ones(int(0.15 * SR)) / int(0.15 * SR), 'same')
        wf = 2200 + 2600 * boost
        out += np.sin(2 * np.pi * np.cumsum(wf) / SR) * boost ** 2 * 0.06 * turbo
        out += bp(noise(dur), 3000, 7000) * boost ** 2 * 0.03 * turbo
    if pops:
        for k in range(pops):
            at = rng.uniform(dur * 0.62, dur * 0.9); i = int(at * SR)
            pop = mix(0.05, (0, thump(240, 90, 0.05, 0.012), 1), (0, hp(noise(0.03), 1200) * env_exp(0.03, 0.006), 0.6))
            place(out, pop * rng.uniform(0.5, 1.0), at)
    fade = np.ones(n); fl = int(0.25 * SR); fade[-fl:] = np.linspace(1, 0, fl) ** 2
    fi = int(0.02 * SR); fade[:fi] = np.linspace(0, 1, fi)
    return out * fade

# ---------- the cues ----------
def cue_select():
    return tail(mix(0.12, (0, click(5200, 0.005), 0.25), (0, mallet(hz('D6'), 0.12, 0.6, 0.05), 0.5), (0, thump(220, 120, 0.05, 0.015), 0.35)), 0.03)

def cue_nav():
    return tail(mix(0.14, (0, click(3600, 0.004, 2), 0.18), (0.005, sweep_noise(0.12, 2500, 6000, 1.2, env_exp(0.12, 0.04, 0.01)), 0.18), (0.01, mallet(hz('A5'), 0.1, 0.3, 0.04), 0.25)), 0.03)

def cue_node():
    return room(mix(0.4, (0, mallet(hz('A5'), 0.3, 0.5, 0.12), 0.6), (0.065, mallet(hz('D6'), 0.32, 0.5, 0.14), 0.6)), 0.25, 0.12)

def cue_card_advance():
    sw = sweep_noise(0.16, 1800, 5200, 1.4, env_exp(0.16, 0.05, 0.02))
    return room(mix(0.35, (0, sw, 0.35), (0.05, kalimba(hz('E6'), 0.3, 0.12), 0.35)), 0.22, 0.1)

def cue_step():
    return room(mix(0.45, (0, mallet(hz('D5'), 0.35, 0.5, 0.15), 0.6), (0.06, mallet(hz('F#5'), 0.35, 0.5, 0.15), 0.55), (0.12, mallet(hz('A5'), 0.35, 0.5, 0.17), 0.5)), 0.26, 0.13)

def cue_correct():
    # two bright mallet hits a fourth apart, a bell an octave above, a little sub pop
    x = mix(0.8,
            (0, mallet(hz('A5'), 0.5, 0.75, 0.16), 0.7), (0, kalimba(hz('A5'), 0.5, 0.15), 0.25),
            (0.085, mallet(hz('D6'), 0.6, 0.8, 0.22), 0.8), (0.085, kalimba(hz('D6'), 0.6, 0.2), 0.3),
            (0.085, bell(hz('D7'), 0.7, 0.25, 1.4), 0.12), (0, thump(260, 140, 0.06, 0.02), 0.3))
    return room(x, 0.35, 0.16)

def cue_repair():
    # friendly, never punishing: two soft muted plucks stepping down, dark felt
    x = mix(0.5, (0, lp(pluck(hz('A3'), 0.3, 0.985, 0.2), 1800), 0.9), (0.11, lp(pluck(hz('F#3'), 0.36, 0.985, 0.15), 1500), 0.85),
            (0, mallet(hz('A4'), 0.2, 0.2, 0.06, 0.4), 0.25), (0.11, mallet(hz('F#4'), 0.25, 0.2, 0.07, 0.4), 0.22))
    return room(x, 0.25, 0.1, 4000)

def cue_toggle_on():
    return tail(mix(0.16, (0, click(3000, 0.005), 0.2), (0, mallet(hz('A5'), 0.08, 0.5, 0.03), 0.4), (0.045, mallet(hz('E6'), 0.1, 0.6, 0.04), 0.45)), 0.03)

def cue_toggle_off():
    return tail(mix(0.16, (0, click(2600, 0.005), 0.2), (0, mallet(hz('E6'), 0.08, 0.4, 0.03), 0.35), (0.045, mallet(hz('A5'), 0.1, 0.4, 0.04), 0.35)), 0.03)

def arpeggio(notes, gap, inst, dur, **kw):
    return [(i * gap, inst(hz(n), dur, **kw), 1.0) for i, n in enumerate(notes)]

def cue_complete():
    items = [(at, s, g * 0.55) for at, s, g in arpeggio(['D5', 'F#5', 'A5', 'D6'], 0.075, mallet, 0.7, hard=0.7, decay=0.25)]
    items += [(at, s, 0.22) for at, s, g in arpeggio(['D5', 'F#5', 'A5', 'D6'], 0.075, kalimba, 0.7, decay=0.2)]
    chord_at = 0.3
    for n in ['D6', 'F#6', 'A6']: items.append((chord_at, bell(hz(n), 1.1, 0.45, 1.6), 0.13))
    items.append((chord_at, pluck(hz('D4'), 1.0, 0.997, 0.5), 0.35))
    items.append((chord_at, thump(150, 60, 0.18, 0.07), 0.45))
    sh = sweep_noise(0.5, 4000, 9000, 3, env_exp(0.5, 0.18, 0.08)); items.append((chord_at, sh, 0.06))
    return room(mix(1.4, *items), 0.5, 0.2)

def cue_milestone():
    items = [(at, s, 0.5) for at, s, g in arpeggio(['D5', 'F#5', 'A5', 'D6', 'F#6', 'A6'], 0.06, mallet, 0.7, hard=0.8, decay=0.22)]
    hit = 0.4
    for n in ['D5', 'A5', 'D6', 'F#6']: items.append((hit, pluck(hz(n), 1.4, 0.9975, 0.6), 0.22))
    for n in ['D6', 'A6', 'D7']: items.append((hit, bell(hz(n), 1.6, 0.6, 1.8), 0.11))
    items.append((hit, thump(140, 50, 0.3, 0.1), 0.6))
    for k, n in enumerate(['A6', 'D7', 'F#7', 'A7', 'D7', 'A7']):
        items.append((hit + 0.12 + k * 0.07, bell(hz(n), 0.5, 0.15, 1.0), 0.05))
    riser = sweep_noise(0.4, 800, 7000, 2.5, np.linspace(0, 1, int(0.4 * SR)) ** 2); items.append((0, riser, 0.05))
    return room(mix(2.2, *items), 0.6, 0.22)

def cue_booster():
    # power-up: a quick riser into a sparkle cascade of bells
    riser = sweep_noise(0.22, 600, 5000, 3, np.linspace(0, 1, int(0.22 * SR)) ** 1.5)
    items = [(0, riser, 0.12)]
    for k, n in enumerate(['D6', 'F#6', 'A6', 'D7', 'F#7']):
        items.append((0.16 + k * 0.045, bell(hz(n), 0.6, 0.22, 1.2), 0.2 - k * 0.02))
        items.append((0.16 + k * 0.045, mallet(hz(n) / 2, 0.3, 0.6, 0.08), 0.18))
    items.append((0.16, thump(300, 150, 0.06, 0.02), 0.3))
    return room(mix(1.0, *items), 0.4, 0.18)

def cue_buy():
    # unlock: a mechanical clunk, a bright chord stab and the booster sparkle
    clunk = metal_clunk(0.25)
    items = [(0, clunk, 0.6), (0, thump(180, 60, 0.15, 0.05), 0.5)]
    for n in ['D5', 'A5', 'D6', 'F#6']: items.append((0.07, pluck(hz(n), 0.9, 0.997, 0.7), 0.25))
    for n in ['A6', 'D7']: items.append((0.07, bell(hz(n), 0.9, 0.35, 1.5), 0.12))
    b = cue_booster(); items.append((0.25, b, 0.5))
    return room(mix(1.6, *items), 0.45, 0.16)

def metal_clunk(dur=0.3, f=310):
    """A struck steel part: inharmonic plate modes plus a dull thud."""
    t = t_axis(dur); out = np.zeros_like(t)
    for ratio, amp, dk in [(1, 1, 0.06), (2.32, 0.6, 0.05), (4.25, 0.4, 0.035), (6.63, 0.25, 0.025)]:
        out += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t / dk)
    out += lp(noise(dur), 1200) * env_exp(dur, 0.012) * 0.8
    return out

def cue_paint():
    # spray can: two rattles of the mixing ball, then a hiss with a little nozzle flutter
    items = []
    for shake in (0, 0.16):
        for k in range(4):
            items.append((shake + k * 0.022, click(rng.uniform(2600, 3400), 0.008, 6) * env_exp(0.008, 0.003), 0.35))
    dur = 0.7; t = t_axis(dur)
    sh = np.minimum(1, t / 0.04) * np.exp(-np.maximum(0, t - 0.5) / 0.08) * (1 + 0.15 * np.sin(2 * np.pi * 23 * t))
    hiss = hp(noise(dur), 3500) * sh
    hiss = peak_eq(hiss, 6500, 1.2, 5)
    items.append((0.36, hiss, 0.22))
    return room(mix(1.2, *items), 0.25, 0.08, 7000)

def cue_part():
    # ratchet wrench: five quick pawl clicks, then the part seats with a clunk
    items = []
    for k in range(5):
        c = mix(0.012, (0, click(3100 + k * 60, 0.012, 9), 1), (0, click(6200, 0.006, 6), 0.4))
        items.append((k * 0.055, c, 0.4))
    items.append((0.31, metal_clunk(0.3, 260), 0.55)); items.append((0.31, thump(160, 70, 0.12, 0.04), 0.5))
    return room(mix(0.8, *items), 0.28, 0.1)

def cue_wheels():
    # impact wrench: a buzzing hammer burst, twice, then the hub clunk
    def burst(d):
        t = t_axis(d); hammer = (np.sin(2 * np.pi * 52 * t) > 0.6).astype(float)
        x = bp(noise(d), 800, 5000) * (0.3 + hammer) + signal.square(2 * np.pi * 104 * t) * 0.15
        return lp(x, 6000) * np.minimum(1, t / 0.01) * np.minimum(1, (d - t) / 0.03)
    items = [(0, burst(0.22), 0.3), (0.3, burst(0.16), 0.3), (0.5, metal_clunk(0.3, 220), 0.55), (0.5, thump(150, 60, 0.14, 0.05), 0.5)]
    return room(mix(0.95, *items), 0.28, 0.1)

def cue_neon():
    # neon on: a zap, a flicker (on-off-on) and a short warm hum
    dur = 0.75; t = t_axis(dur)
    hum = sum(np.sin(2 * np.pi * 120 * k * t) / k for k in (1, 2, 3, 5)) * 0.4 + bp(noise(dur), 2000, 6000) * 0.05
    gate = np.ones_like(t)
    for a, b in [(0.06, 0.1), (0.14, 0.17)]: gate[int(a * SR):int(b * SR)] = 0.05
    gate *= np.exp(-np.maximum(0, t - 0.45) / 0.12)
    gate = np.convolve(gate, np.ones(80) / 80, 'same')
    zap = hp(noise(0.05), 2500) * env_exp(0.05, 0.01) + np.sin(2 * np.pi * np.cumsum(np.geomspace(5000, 900, int(0.05 * SR))) / SR) * env_exp(0.05, 0.015)
    sparkle = bell(hz('F#7'), 0.4, 0.12, 1.0)
    return room(mix(1.0, (0, zap, 0.45), (0.02, hum * gate, 0.32), (0.2, sparkle, 0.06)), 0.3, 0.12)

def cue_lower():
    # air suspension: a valve hiss sliding down as the car drops, then it settles on its springs
    dur = 0.6
    hiss = sweep_noise(dur, 7000, 1100, 1.0, np.minimum(1, t_axis(dur) / 0.02) * np.exp(-t_axis(dur) / 0.3))
    t = t_axis(0.4); spring = np.sin(2 * np.pi * 7 * t) * np.exp(-t / 0.1)
    settle = thump(110, 55, 0.25, 0.08)
    items = [(0, click(2400, 0.01, 4), 0.3), (0.01, hiss, 0.3), (0.42, settle, 0.7), (0.42, metal_clunk(0.2, 180), 0.2)]
    return room(mix(1.0, *items), 0.3, 0.08)

def cue_plate():
    # rubber stamp: a quick lift-swish, the firm stamp and a paper tick
    items = [(0, sweep_noise(0.08, 3000, 1500, 1.5, env_exp(0.08, 0.03, 0.01)), 0.12),
             (0.09, thump(200, 70, 0.14, 0.035), 0.75), (0.09, lp(noise(0.03), 2500) * env_exp(0.03, 0.006), 0.4),
             (0.1, click(4800, 0.004, 3), 0.25), (0.16, mallet(hz('D6'), 0.2, 0.4, 0.06), 0.2)]
    return room(mix(0.5, *items), 0.25, 0.1)

def cue_color():
    # swatch: a round bubbly blip that glides up a fifth
    dur = 0.14; t = t_axis(dur); f = hz('D5') * 2 ** (np.minimum(1, t / 0.05) * 7 / 12)
    blip = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(dur, 0.04, 0.003)
    return tail(mix(0.16, (0, blip, 0.6), (0, click(5000, 0.003), 0.12)), 0.04)

def cue_exam_pass():
    return cue_milestone()

def cue_exam_fail():
    # gentle, not a sad trombone: warm descending thirds that land on the tonic
    items = []
    for k, n in enumerate(['A4', 'F#4', 'D4']):
        items.append((k * 0.16, pluck(hz(n), 0.8, 0.996, 0.35), 0.45)); items.append((k * 0.16, mallet(hz(n), 0.5, 0.3, 0.2, 0.6), 0.3))
    items.append((0.32, bell(hz('D5'), 1.0, 0.4, 0.8), 0.06))
    return room(mix(1.3, *items), 0.45, 0.16, 5000)

ENGINES = {
    # rpm curve (time, rpm): idle -> blip -> rev -> back to idle
    'scooter': dict(rpm_curve=[(0, 1700), (0.12, 1800), (0.35, 7200), (0.6, 8600), (0.85, 4200), (1.3, 1900), (1.5, 1800)], cylinders=2, dur=1.5, bright=1.3, rasp=0.9, pipe=(180, 900, 2600)),
    'smallcar': dict(rpm_curve=[(0, 850), (0.12, 900), (0.4, 4200), (0.62, 5200), (0.95, 2200), (1.4, 950), (1.6, 900)], cylinders=4, dur=1.6, bright=0.9, rasp=0.45, pipe=(120, 520, 1700)),
    'bigcar': dict(rpm_curve=[(0, 650), (0.15, 700), (0.45, 3600), (0.7, 4300), (1.05, 1600), (1.5, 720), (1.8, 680)], cylinders=8, dur=1.8, bright=0.6, rasp=0.35, burble=1, pipe=(75, 300, 1100)),
    'racecar': dict(rpm_curve=[(0, 1100), (0.1, 1300), (0.35, 7600), (0.55, 9200), (0.8, 3800), (1.3, 1300), (1.6, 1150)], cylinders=6, dur=1.6, bright=1.1, rasp=0.6, pipe=(140, 640, 2300), turbo=1.0, pops=5),
}

CUES = {
    # name: (renderer, category)
    'select': (cue_select, 'ui'), 'nav': (cue_nav, 'ui'), 'node': (cue_node, 'ui'), 'card-advance': (cue_card_advance, 'ui'),
    'toggle-on': (cue_toggle_on, 'ui'), 'toggle-off': (cue_toggle_off, 'ui'), 'color': (cue_color, 'ui'),
    'step': (cue_step, 'feedback'), 'correct': (cue_correct, 'feedback'), 'repair': (cue_repair, 'feedback'),
    'paint': (cue_paint, 'foley'), 'part': (cue_part, 'foley'), 'wheels': (cue_wheels, 'foley'), 'neon': (cue_neon, 'foley'),
    'lower': (cue_lower, 'foley'), 'plate': (cue_plate, 'foley'),
    'booster': (cue_booster, 'reward'), 'buy': (cue_buy, 'reward'), 'complete': (cue_complete, 'reward'), 'milestone': (cue_milestone, 'reward'),
    'exam-pass': (cue_exam_pass, 'reward'), 'exam-fail': (cue_exam_fail, 'feedback'),
}
for base, kw in ENGINES.items():
    CUES['rev-' + base] = ((lambda kw=kw: room(engine(**kw), 0.3, 0.08, 5000)), 'engine')

# Loudness targets (K-weighted, LUFS over the loud part). UI sits under the voice; rewards stand out.
TARGET = {'ui': -26, 'feedback': -21, 'foley': -22, 'reward': -19, 'engine': -20}

def k_weight(x):
    # ITU-R BS.1770 pre-filter (high shelf + RLB high-pass) at 44.1 kHz
    b1, a1 = [1.53090959, -2.65116903, 1.16916686], [1.0, -1.66375011, 0.71265753]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.98998938, 0.99000187]
    return signal.lfilter(b2, a2, signal.lfilter(b1, a1, x))

def loudness(x):
    """Max short window (100 ms) K-weighted loudness; a fair measure for cues shorter than a second."""
    y = k_weight(x) ** 2; w = int(0.1 * SR)
    ms = np.convolve(y, np.ones(w) / w, 'valid') if len(y) > w else np.array([y.mean()])
    return -0.691 + 10 * np.log10(ms.max() + 1e-12)

def master(x, target):
    x = x - np.mean(x)
    x = hp(x, 40, 2)  # nothing useful below 40 Hz on any speaker
    x *= 10 ** ((target - loudness(x)) / 20)
    # soft-knee peak limiter (true peak via 4x oversampling)
    up = signal.resample_poly(x, 4, 1); pk = np.max(np.abs(up))
    ceiling = 10 ** (-1 / 20)
    if pk > ceiling:
        env = np.abs(up); env = np.maximum.accumulate(env[::-1])[::-1] if False else env
        g = np.minimum(1, ceiling / np.maximum(env, 1e-9))
        g = signal.lfilter([0.02], [1, -0.98], np.concatenate([np.ones(400), g]))[400:]  # smooth gain
        g = np.minimum(g, ceiling / np.maximum(np.abs(up), 1e-9))
        x = signal.resample_poly(up * g, 1, 4)[:len(x)]
    # trim trailing silence, short fade out
    a = np.abs(x); last = np.nonzero(a > 10 ** (-70 / 20))[0]
    x = x[:last[-1] + 1] if len(last) else x
    fl = min(len(x), int(0.015 * SR)); x[-fl:] *= np.linspace(1, 0, fl)
    return x

def phone_check(x):
    """What a phone speaker keeps: little below 300 Hz. Reported so no cue disappears there."""
    return loudness(hp(x, 300, 4)) - loudness(x)

def write_wav(path, x):
    import wave
    pcm = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

def sheet(rendered, path):
    from PIL import Image, ImageDraw
    cols = 4; W, H = 360, 150; rows = (len(rendered) + cols - 1) // cols
    img = Image.new('RGB', (cols * W, rows * H), 'white'); d = ImageDraw.Draw(img)
    for k, (name, x, info) in enumerate(rendered):
        X, Y = (k % cols) * W, (k // cols) * H
        f, tt, S = signal.spectrogram(x, SR, nperseg=512, noverlap=384)
        S = 10 * np.log10(S + 1e-12); S = np.clip((S - S.max() + 80) / 80, 0, 1)[::-1]
        S = S[int(len(S) * 0.0):]  # full band
        sp = Image.fromarray((255 - S * 255).astype(np.uint8)).resize((W - 10, H - 50))
        img.paste(sp.convert('RGB'), (X + 5, Y + 22))
        wv = x[:: max(1, len(x) // (W - 10))][:W - 10]
        for i, v in enumerate(wv): d.line([(X + 5 + i, Y + H - 14), (X + 5 + i, Y + H - 14 - abs(v) * 22)], fill=(40, 120, 255))
        d.text((X + 6, Y + 4), f"{name}  {len(x) / SR:.2f}s  {info}", fill='black')
    img.save(path)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True); os.makedirs(WAV, exist_ok=True)
    only = sys.argv[1:]
    rendered, report = [], {}
    for name, (fn, cat) in CUES.items():
        if only and name not in only: continue
        x = master(fn(), TARGET[cat])
        wav = os.path.join(WAV, name + '.wav'); write_wav(wav, x)
        mp3 = os.path.join(OUT, name + '.mp3')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '96k', '-ar', str(SR), '-ac', '1', mp3], check=True)
        tp = 20 * np.log10(np.max(np.abs(signal.resample_poly(x, 4, 1))) + 1e-12)
        report[name] = {'category': cat, 'seconds': round(len(x) / SR, 3), 'loudness': round(loudness(x), 1), 'truePeak': round(tp, 1), 'phoneLoss': round(phone_check(x), 1), 'bytes': os.path.getsize(mp3)}
        rendered.append((name, x, f"{report[name]['loudness']} LU  pk {report[name]['truePeak']}"))
        print(name, report[name])
    json.dump(report, open(os.path.join(HERE, 'report.json'), 'w'), indent=1)
    sheet(rendered, os.path.join(HERE, 'spectrograms.png'))
    print('total kB', sum(r['bytes'] for r in report.values()) // 1024)
