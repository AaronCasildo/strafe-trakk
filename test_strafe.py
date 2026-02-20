"""
Simulates A/D key presses with random timing to test Strafe Trakk.
Adjust LOOPS to control how many strafe pairs to simulate.
"""

import time
import random
import keyboard

LOOPS = 50  # Number of strafe pairs to simulate

def main():
    print(f"Starting in 3 seconds... (will do {LOOPS} strafes)")
    time.sleep(3)

    for i in range(LOOPS):

        # Transition time: 0ms = perfect, 1-100ms = late
        transition = random.randint(0, 100) / 1000

        # Pick a random direction (A→D or D→A)
        pattern = random.choice(["clean_ad", "clean_da"])

        if pattern == "clean_ad":
            # A held → A released → gap → D pressed → D released (perfect to late strafe)
            keyboard.press('a')
            time.sleep(200 / 1000) # Hold A for 200ms
            keyboard.release('a')
            time.sleep(transition)
            keyboard.press('d')
            time.sleep(200 / 1000) # Hold D for 200ms
            keyboard.release('d')
            label = f"A→D, gap={transition*1000:.0f}ms"

        else:  # clean_da
            # D held → D released → gap → A pressed → A released (perfect to late strafe)
            keyboard.press('d')
            time.sleep(200 / 1000) # Hold D for 200ms
            keyboard.release('d')
            time.sleep(transition)
            keyboard.press('a')
            time.sleep(200 / 1000) # Hold A for 200ms
            keyboard.release('a')
            label = f"D→A, gap={transition*1000:.0f}ms"

        # Small gap between strafe pairs
        time.sleep(400 / 1000) # 400ms between pairs

        print(f"[{i + 1}/{LOOPS}] {label}")

    print("Done!")

if __name__ == "__main__":
    main()