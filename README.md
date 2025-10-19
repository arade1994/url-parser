# Script pre-start

- install pnpm globally
- install node modules with `pnpm install`

# Script run

- `pnpm run dev .\files\urls.txt` -> or any other file (relative path)
- `pnpm run dev` -> and type the text into terminal
- `echo '[www.google.com]' | pnpm run dev` -> to immediately send text to the stdin

# Script production start

- Before running the script it's necessary to run `pnpm run build:cjs` or `pnpm run build`
- Prod mode runs with `pnpm start` with exactly the same commands like above for the dev mode:
  - `pnpm start .\files\urls.txt`
  - `pnpm start` -> and type the text into terminal
  - `echo '[www.google.com]' | pnpm start`
