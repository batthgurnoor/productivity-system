# Contributing

Thanks for checking out this repo and thinking about contributing.

This project started as my own productivity system, and I�m opening it up as it becomes stable. I want contributions to be practical, respectful, and easy to review.

## Before you start

- Read the `README.md` so you understand the current scope and roadmap.
- If you�re planning a bigger change, open an issue first so we can align on direction.
- Keep changes focused. Small PRs are much easier to review and merge.

## Setup

1. Clone the repo.
2. Run backend:
   - `cd backend`
   - `./mvnw spring-boot:run` (or `mvnw.cmd` on Windows)
3. Run frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

Details are in `README.md` if anything changes.

Optional: you can also use **Docker Compose** for a one-command local run (see `README.md` ? **Docker**).

## How to contribute

1. Fork the repo.
2. Create a branch from `main`.
3. Make your changes.
4. Run checks locally:
   - Backend: `./mvnw test` (or `mvnw.cmd test` on Windows)
   - Frontend: `npm run build`
5. Open a pull request with a clear description.

## Pull request expectations

A good PR usually includes:

- A short summary of what changed and why.
- Any tradeoffs or follow-up work.
- Testing notes (what you ran manually or automated).
- Screenshots/GIFs if there are UI changes.

## License

By contributing to this repository, you agree that your contributions will be licensed under the project�s [MIT License](LICENSE).

## Coding style (lightweight)

- Match the existing style in the file you touch.
- Prefer readable code over clever code.
- Add/adjust docs when behavior changes.
- Don�t add unrelated refactors in the same PR.

## Good first contributions

- Small UI polish issues
- Docs and README improvements
- Validation and error-message improvements
- Test coverage improvements

## Questions

If anything is unclear, open an issue and ask. I�d rather answer early than untangle assumptions later.