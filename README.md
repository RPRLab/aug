# RPR Lab AWS User's Group

Documentation for the RPR Lab AWS User's Group, built with [Zensical](https://zensical.org/) and published at <https://rprlab.github.io/aug/>.

## Local development

Install Python 3.13 or newer and [uv](https://docs.astral.sh/uv/getting-started/installation/), then synchronize the locked environment:

```sh
uv sync --locked
```

Start the local documentation server:

```sh
uv run --locked zensical serve
```

Create a clean production build:

```sh
uv run --locked zensical build --clean
```

Generated files are written to `site/` and are not committed.

## Preferred pull-request workflow

The `main` branch is protected: changes must be merged through a pull request, force pushes and branch deletion are blocked, review conversations must be resolved, and the required `Workers Builds: aug-preview` Cloudflare check must pass.

Create a short, descriptive branch directly in `RPRLab/aug`, for example `improve-ec2-guide`. Branches in the main repository receive automatic Cloudflare preview deployments; branches in forks do not.

Start from the latest `main`:

```sh
git switch main
git pull --ff-only --prune
git switch -c improve-ec2-guide
```

Make and validate the changes, then commit and push only the intended files:

```sh
uv run --locked zensical build --clean
git add path/to/changed-file.md
git commit -m "docs: improve EC2 guide"
git push -u origin HEAD
```

Open the pull request:

```sh
gh pr create --base main --fill
```

Wait for `Workers Builds: aug-preview` to pass and use the Cloudflare preview URL posted on the pull request to review the rendered site. Resolve any open review conversations, then merge the pull request and delete the feature branch:

```sh
gh pr checks --watch
gh pr merge --merge --delete-branch
git switch main
git pull --ff-only --prune
```

## GitHub Pages

The [deployment workflow](.github/workflows/docs.yml) builds the site from the locked dependencies and publishes it whenever `main` changes. It can also be run manually from the repository's **Actions** tab.
