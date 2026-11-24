# Accessibility

[pierrevieira.com](https://pierrevieira.com) aims to work for everyone, whatever the device, the screen size or the way
they use it.

## Supported environments

A current version of Chrome, Edge, Firefox or Safari, on phones, tablets and computers. The page is plain HTML, so it
works with the browser's own screen reader support (VoiceOver, TalkBack, NVDA, JAWS, Narrator), its zoom and the
keyboard.

## What I commit to

- **Contrast.** Text reads at 4.5:1 or more on what is behind it, and every icon or edge that carries meaning at 3:1
  (WCAG 2.2 AA), in light and dark mode. The theme follows the system's unless one is picked.
- **Text size and zoom.** The page reflows at 200% zoom and at a phone's width, with no sideways scrolling.
- **Screen readers.** The page uses headings, landmarks and lists; links, buttons and images have labels, and
  decorative images and icons are hidden from screen readers.
- **Keyboard.** A **Skip to content** link comes first; every control, the language and theme menus included, is
  reachable with the keyboard, shows a focus ring and closes with Escape.
- **Motion.** With `prefers-reduced-motion` the page is still and complete: nothing rises into view.
- **Language.** The page is in English, Portuguese (Brazil) and Spanish. It follows the browser's language, sets the
  page's `lang`, and the screenshots that show words come in each language.

## Known limitations

- The résumé is a PDF; its accessibility depends on the reader it opens in.
- The talks are YouTube videos, with the captions YouTube provides.

## Reporting a barrier

If something on the page is hard or impossible to use with your device, setting or assistive technology, please open an
issue with the **Bug report** template: say which browser and device, fill in its assistive technology field, and what
got in the way. Barriers are treated as bugs, and fixed with the same priority.
