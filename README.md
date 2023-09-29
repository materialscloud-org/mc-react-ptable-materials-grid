# React periodic table and materials grid

A React component for filtering and selecting materials, consisting of an integrated periodic table and a data grid.

Built with [ag-grid](https://www.ag-grid.com/react-data-grid/).

The corresponding `npm` package contains only the `MaterialSelector` component defined in `src/MaterialSelector/index.js`.

This repository can also be ran standalone, which renders the `MaterialSelector` component populated with the MC3D data.

## Development

To make a new version and publish to npm via GitHub Actions:

```bash
npm version <patch/minor/major>
git push --tags
```
