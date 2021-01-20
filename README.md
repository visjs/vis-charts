# vis-charts

**This is mostly (same export structure) a "plug'n & play replacement" for [vis](https://github.com/almende/vis), wich is no longer maintained**

Vis.js is a dynamic, browser based visualization library.
The library is designed to be easy to use, handle large amounts
of dynamic data, and enable manipulation of the data.
The library consists of the following components:

- [DataSet and DataView](https://github.com/visjs/vis-data). A flexible key/value based data set. Add, update, and
  remove items. Subscribe on changes in the data set. A DataSet can filter and
  order items, and convert fields of items. A filtered and/or formatted view on a DataSet.
- [Network](https://github.com/visjs/vis-network). Display a network (force directed graph) with nodes and edges.
- [Timeline and Graph2d](https://github.com/visjs/vis-timeline). Display different types of data on a timeline.
- [Graph3d](https://github.com/visjs/vis-graph3d). Display data in a three dimensional graph.

This repository bundles multiple libraries:

- [vis-data](//github.com/visjs/vis-data)
- [vis-network](//github.com/visjs/vis-network)
- [vis-timeline](//github.com/visjs/vis-timeline)
- [vis-graph3d](//github.com/visjs/vis-graph3d)

It also includes other external libraries:

- [moment.js](//www.npmjs.com/package/moment)
- [@egjs/hammerjs](//www.npmjs.com/package/@egjs/hammerjs)
- [keycharm](//www.npmjs.com/package/keycharm)
- [timsort](//www.npmjs.com/package/timsort)
- _and some propably more..._

## Badges

[![Backers on Open Collective](https://opencollective.com/visjs/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/visjs/sponsors/badge.svg)](#sponsors)

## Usage

:warning: **This library is very big and should better not be used! Please use one of the libraries from the [visjs family](//github.com/visjs) instead!**

If you really want to, you can replace your old `almende/vis@4.12` files with our new one (replace `latest` by a specific version to prevent unexpected updates):

```html
<script src="//unpkg.com/vis-charts@latest/dist/vis.min.js"></script>
<link href="//unpkg.com/vis-charts@latest/dist/vis.min.css" rel="stylesheet" type="text/css">
```

## Contribute

Contributions to the [visjs libraries](https://github.com/visjs) are very welcome! We can't do this alone!

### Backers

Thank you to all our backers! 🙏

<a href="https://opencollective.com/vis#backers" target="_blank"><img src="https://opencollective.com/visjs/backers.svg?width=890"></a>

### Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website.

<a href="https://opencollective.com/visjs/sponsor/0/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/1/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/2/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/3/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/4/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/5/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/6/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/7/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/8/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/visjs/sponsor/9/website" target="_blank"><img src="https://opencollective.com/visjs/sponsor/9/avatar.svg"></a>

## License

Copyright (c) 2014-2017 Almende B.V. and contributors
Copyright (c) 2017-2020 vis.js contributors

Vis.js is dual licensed under both

  * The Apache 2.0 License
    http://www.apache.org/licenses/LICENSE-2.0

and

  * The MIT License
    http://opensource.org/licenses/MIT

Vis.js may be distributed under either license.
