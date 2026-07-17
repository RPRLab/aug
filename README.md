# AUG

Documentation for the RPR Lab AWS User's Group, built with [Zensical](https://zensical.org/) and published at <https://rprlab.github.io/aug/>.

## Local development

Install [uv](https://docs.astral.sh/uv/getting-started/installation/), then synchronize the locked environment:

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

## GitHub Pages

The [deployment workflow](.github/workflows/docs.yml) builds the site from the locked dependencies and publishes it whenever `main` changes. It can also be run manually from the repository's **Actions** tab.
