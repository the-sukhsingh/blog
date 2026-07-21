# 001 — Improve Table of Contents transition and closing feel

- **Status**: DONE
- **Commit**: f36bed1
- **Severity**: HIGH
- **Category**: Easing & duration, Interruptibility, Performance
- **Estimated scope**: 1 file (src/components/TableOfContents.tsx)

## Problem

The Table of Contents container toggle transition feels laggy and sluggish. This is caused by:
1. **Closing Delay**: When closing the TOC, it staggers the exit animation of all child elements (`staggerChildren: 0.015`, `staggerDirection: -1`). If there are many headings, this creates a significant delay (up to 300ms+) before the container even begins to shrink, making the UI feel heavy and unresponsive.
2. **Competing Springs**: The container uses a spring layout animation while the child items animate with their own spring transforms concurrently under stagger children. This causes significant layout calculations on the main thread inside a scrollable container, leading to frame drops.

Verbatim code in `src/components/TableOfContents.tsx:124-171`:

```tsx
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.025,
            }
        },
        exit: {
            opacity: 0,
            transition: {
                staggerChildren: 0.015,
                staggerDirection: -1
            }
        }
    } as const

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 350,
                damping: 25
            }
        },
        exit: {
            opacity: 0,
            y: 10,
            transition: {
                duration: 0.1
            }
        }
    } as const

    return (
        <div className='pointer-events-none fixed bottom-4 left-0 right-0 z-10000 flex justify-center px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-foreground select-none' >
            <motion.div
                ref={tocRef}
                layout
                transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 32
                }}
```

## Target

1. **Remove exit stagger**: When closing, the container and all items should fade out concurrently in 120ms to provide instant feedback.
2. **Snappier entrance springs**: Reduce vertical translation offsets (from `15px` to `8px`) and make entrance spring stiffer/faster.
3. **Responsive ease-out layout transition**: Replace the spring layout resizing with a fast, hardware-friendly custom cubic-bezier curve (`ease-out`: `[0.23, 1, 0.32, 1]`) to prevent layout thrashing and stutter.

Target code in `src/components/TableOfContents.tsx`:

```tsx
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.015,
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.12
            }
        }
    } as const

    const itemVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 30
            }
        },
        exit: {
            opacity: 0,
            y: 4,
            transition: {
                duration: 0.1
            }
        }
    } as const

    return (
        <div className='pointer-events-none fixed bottom-4 left-0 right-0 z-10000 flex justify-center px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-foreground select-none' >
            <motion.div
                ref={tocRef}
                layout
                transition={{
                    duration: 0.22,
                    ease: [0.23, 1, 0.32, 1]
                }}
```

## Repo conventions to follow

- Easing curve values align with the strong ease-out standard: `cubic-bezier(0.23, 1, 0.32, 1)` for UI transitions.

## Steps

1. In `src/components/TableOfContents.tsx`, replace `containerVariants` definition to remove the exit stagger children transition and set exit duration to `0.12`.
2. In `src/components/TableOfContents.tsx`, replace `itemVariants` to change `y` offset to `8` (hidden) / `4` (exit), and make visible transition spring stiffer with `stiffness: 400` and `damping: 30`.
3. In `src/components/TableOfContents.tsx`, replace the `layout` `transition` prop configuration on `<motion.div>` from spring parameters to a tween with `duration: 0.22` and `ease: [0.23, 1, 0.32, 1]`.

## Boundaries

- Do NOT touch layout logic or background variables inside `TableOfContents.tsx`.
- Do NOT change state management, scrolling hooks, or index spy helpers.

## Verification

- **Mechanical**: Run `npx tsc --noEmit` and check that compilation succeeds.
- **Feel check**:
  - Open an article page and tap the floating index pill. The list panel should expand rapidly and smoothly.
  - Click outside or press `Escape` to close it. The list should disappear instantly (no delayed staggered exit).
  - In DevTools, open the Rendering panel, check "Enable paint flashing", and confirm that toggling the TOC resizes the container layout smoothly without layout reflow spikes.
  - Set playback speed to 10% in the DevTools Animations panel and verify the opening stagger is fast and crisp.
- **Done when**: TOC opens and closes instantly with zero frame drops or lag.
