"""
Simulates A/D key presses with random timing to test Strafe Trakk.
Adjust LOOPS to control how many strafe pairs to simulate.
"""

import time
import random
import keyboard

# TEST CONFIGURATION

LOOPS = 50  # Number of strafe pairs to simulate
TRANSITION_RANGE_MS = (0, 20)  # Range of transition times in milliseconds (0-20ms)
KEY_HOLD_TIME_MS = 200  # Time to hold each key in milliseconds
PAIR_GAP_TIME_MS = 400  # Time between strafe pairs in milliseconds

def main():
    print(f"Starting in 3 seconds... (will do {LOOPS} strafes)")
    time.sleep(3)

    for i in range(LOOPS):

        # Transition time: 0ms = perfect, 1-100ms = late
        transition = random.randint(TRANSITION_RANGE_MS[0], TRANSITION_RANGE_MS[1]) / 1000

        # Pick a random direction (A→D or D→A)
        pattern = random.choice(["clean_ad", "clean_da"])

        if pattern == "clean_ad":
            # A held → A released → gap → D pressed → D released (perfect to late strafe)
            keyboard.press('a')
            time.sleep(KEY_HOLD_TIME_MS / 1000) # Hold A for KEY_HOLD_TIME_MS
            keyboard.release('a')
            time.sleep(transition)
            keyboard.press('d')
            time.sleep(KEY_HOLD_TIME_MS / 1000) # Hold D for KEY_HOLD_TIME_MS
            keyboard.release('d')
            label = f"A→D, gap={transition*1000:.0f}ms"

        else:  # clean_da
            # D held → D released → gap → A pressed → A released (perfect to late strafe)
            keyboard.press('d')
            time.sleep(KEY_HOLD_TIME_MS / 1000) # Hold D for KEY_HOLD_TIME_MS
            keyboard.release('d')
            time.sleep(transition)
            keyboard.press('a')
            time.sleep(KEY_HOLD_TIME_MS / 1000) # Hold A for KEY_HOLD_TIME_MS
            keyboard.release('a')
            label = f"D→A, gap={transition*1000:.0f}ms"

        # Small gap between strafe pairs
        time.sleep(PAIR_GAP_TIME_MS / 1000) # 400ms between pairs

        print(f"[{i + 1}/{LOOPS}] {label}")

    print("Done!")

if __name__ == "__main__":
    main()