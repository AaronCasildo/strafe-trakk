"""
Simulates A/D key presses with random timing to test Strafe Trakk.
Includes both early (overlap) and late (gap) counterstrafe patterns.
Adjust LOOPS to control how many strafe pairs to simulate.
"""

import time
import random
import keyboard

# TEST CONFIGURATION

LOOPS = 100  # Number of strafe pairs to simulate
LATE_RANGE_MS = (0, 100)  # Range for late strafes (gap after release) in milliseconds
EARLY_RANGE_MS = (0, 100)  # Range for early strafes (overlap before release) in milliseconds
KEY_HOLD_TIME_MS = 200  # Time to hold each key in milliseconds
PAIR_GAP_TIME_MS = 400  # Time between strafe pairs in milliseconds

def main():
    print(f"Starting in 3 seconds... (will do {LOOPS} strafes)")
    time.sleep(3)

    for i in range(LOOPS):

        # Randomly choose between early (overlap) or late (gap) strafe
        is_early = random.choice([True, False])
        
        if is_early:
            # Early: press second key BEFORE releasing first (overlap)
            overlap = random.randint(EARLY_RANGE_MS[0], EARLY_RANGE_MS[1]) / 1000
            pattern = random.choice(["early_ad", "early_da"])
        else:
            # Late: release first key, wait, then press second (gap)
            gap = random.randint(LATE_RANGE_MS[0], LATE_RANGE_MS[1]) / 1000
            pattern = random.choice(["late_ad", "late_da"])

        if pattern == "early_ad":
            # A pressed → hold → D pressed (while A still held) → A released → hold D → D released
            keyboard.press('a')
            time.sleep(KEY_HOLD_TIME_MS / 1000)
            keyboard.press('d')  # Press D while A is still held
            time.sleep(overlap)
            keyboard.release('a')  # Release A after overlap
            time.sleep(KEY_HOLD_TIME_MS / 1000)
            keyboard.release('d')
            label = f"A→D early, overlap={overlap*1000:.0f}ms"

        elif pattern == "early_da":
            # D pressed → hold → A pressed (while D still held) → D released → hold A → A released
            keyboard.press('d')
            time.sleep(KEY_HOLD_TIME_MS / 1000)
            keyboard.press('a')  # Press A while D is still held
            time.sleep(overlap)
            keyboard.release('d')  # Release D after overlap
            time.sleep(KEY_HOLD_TIME_MS / 1000)
            keyboard.release('a')
            label = f"D→A early, overlap={overlap*1000:.0f}ms"

        elif pattern == "late_ad":
            # A held → A released → gap → D pressed → D released
            keyboard.press('a')
            time.sleep(KEY_HOLD_TIME_MS / 1000)
            keyboard.release('a')
            time.sleep(gap)
            keyboard.press('d')
            time.sleep(KEY_HOLD_TIME_MS / 1000)
            keyboard.release('d')
            label = f"A→D late, gap={gap*1000:.0f}ms"

        else:  # late_da
            # D held → D released → gap → A pressed → A released
            keyboard.press('d')
            time.sleep(KEY_HOLD_TIME_MS / 1000)
            keyboard.release('d')
            time.sleep(gap)
            keyboard.press('a')
            time.sleep(KEY_HOLD_TIME_MS / 1000)
            keyboard.release('a')
            label = f"D→A late, gap={gap*1000:.0f}ms"

        # Small gap between strafe pairs
        time.sleep(PAIR_GAP_TIME_MS / 1000)

        print(f"[{i + 1}/{LOOPS}] {label}")

    print("Done!")

if __name__ == "__main__":
    main()