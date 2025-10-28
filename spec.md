# Large Format Pain Simulator: App Specification

## 1. Core Concept

A  mobile application that simulates large format black and white photography. The app is divided into three core views: Camera, Bathroom (Darkroom), and Negatives (Gallery).

---

## 2. Features & Requirements

### 2.1. Camera View

*   **Shooting Mechanism:** A two-step process to simulate the real workflow.
    1.  **"Insert Film Holder":** Pressing this button blacks out the live preview.
    2.  **"EXPOSE":** A prominent red button appears to capture the image.
*   **Live Preview ("Ground Glass"):**
    *   **Aspect Ratio:** Landscape 5:4.
    *   **Appearance:** Dim, color preview to simulate looking at ground glass.
    *   **Dynamic Brightness:** The preview's brightness is directly tied to the aperture setting—brighter at f/5.6 and progressively darker, becoming barely visible at f/64.
*   **Controls:**
    *   **Focus:** A manual dial control with no "in-focus" indicator, requiring user judgment.
    *   **Aperture & Shutter:** Settings are adjusted via dedicated dial controls.
*   **Shot Limit:**
    *   The user has **24 reusable film holders**.
    *   The number of available shots is determined by the number of empty holders.
    *   Developing film in the Bathroom frees up holders for reuse.

### 2.2. Bathroom (Darkroom) View

*   **Batch Development:** Users can select and develop up to **6 films at once**.
*   **Development Prerequisites:**
    *   **Wait Time:** A mandatory 6-hour waiting period after capture before a film can be developed.
    *   **Anonymity:** The list of undeveloped films is shuffled and displayed without capture times, simulating the chaos of mixing up film holders.
*   **Development Process (Modal):**
    1.  **Chores:** The user must complete a checklist of "chemical mixing" chores.
    2.  **Agitation:** The user must agitate the virtual developing tank.
        *   **Primary Method:** Shaking the physical device.
        *   **Fallback:** Tapping a developer tank icon, which triggers a gentle shake animation for feedback.

### 2.3. Negatives (Gallery) View

*   **Display:**
    *   Shows all successfully developed photos.
    *   All negatives combined a 4x5 film frame shape look with cutout notch and little tab and a whiter color frame around
    *   **Negatives Only:** All images are permanently displayed as inverted, grayscale negatives to maintain the darkroom theme.
    *   **Aspect Ratio:** Landscape 5:4.
*   **Drying Process:**
    *   After development, negatives are "wet" and must "dry" for 1 hour.
    *   Wet negatives are overlaid with a "Drying..." status indicator.
*   **Photo Details:** Viewing a negatives only displays the isses it acquired.

### 2.4. The "Pain": Simulated Errors

During development, photos are subjected to a series of random, combinable errors to simulate the unpredictability of the analog process.

*   **Blank Frame (White or Black):** ~5%
*   **Double Exposure:** Two shots exposed over each other, the other negative is full White ~2%
*   **Out of Focus:** min: 10% chance if the user missed focus. change increases as the apertrure is lower. At min aperture chance is 70%
    **Motion blur** min: 5%, chance increases with lower shutter speed , 1/125 10%,  more than 1s: 90% chhance
*   **Under/Over Exposed:** ~15%
*   **Scratches/Hair/Dust marks:** ~20%
*   **Light Leaks:** ~20%
*   **Finger print(s)** one ore more random fingerprint marks on the negative : ~10%

### 2.5. Developer Mode

*   A global `DEV_MODE` flag in `constants.ts`.
*   When `true`: All timers (develop wait, dry time) are reduced to a few seconds.

---

## 3. Visual Guidelines

*   **Theme:** Dark, minimalist, and utilitarian, evoking analog camera hardware and darkroom aesthetics.
*   **Color Palette:**
    *   **Background:** Black (`#000000`) and Dark Zinc (`bg-zinc-900`).
    *   **UI Panels:** Medium Zinc (`bg-zinc-800`).
    *   **Borders:** Gray Zinc (`border-zinc-700`).
    *   **Text:** Primarily white and shades of gray (`text-zinc-200` to `text-zinc-500`).
    *   **Accents:** `Green` for success, `Blue` for selection, `Red` for critical actions (EXPOSE), `Yellow` for warnings/imperfections.
*   **Typography:** A monospaced font (`font-mono`) is used exclusively to create a technical, retro feel.
*   **Controls:** Aperture, Shutter, and Focus controls are custom-designed as symbolic "lens ring" dials, showing previous, current, and next values in a compact arc.
*   **Icons:** Clean, line-art SVG icons are used for navigation and in-app elements (e.g., Beaker, Dev Tank).
*   **Negative Frame:** A specific image of a film holder is used as a frame/background for all negatives in the gallery, ensuring an authentic look. This is applied robustly via CSS `background-image`.
