# vis-charts

**This is a "pug'n & play replacement" for [vis](https://github.com/almende/vis), wich is no longer maintained**

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

**This version of the original [vis](https://github.com/almende/vis) library is based on the lates state of the [`develop` branch (320b18), from 20.02.2019](https://github.com/almende/vis/commit/320b1809fcbdf1d281e54ab8baa3daf84a1f358b) and started therefore as an improved version 4.21. From there on we developed this repository further. You are welcome to help!**

## Badges

[![Backers on Open Collective](https://opencollective.com/visjs/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/visjs/sponsors/badge.svg)](#sponsors) 

## Install

Install via npm:

    $ npm install vis-charts

## Build

To build the library from source, clone the project from github

    $ git clone git://github.com/visjs/vis-charts.git

The source code uses the module style of node (require and module.exports) to
organize dependencies. To install all dependencies and build the library,
run `npm install` in the root of the project.

    $ cd vis
    $ npm install

Then, the project can be build running:

    $ npm run build

## Test

To test the library, install the project dependencies once:

    $ npm install

Then run the tests:

    $ npm run test

## Contribute

Contributions to the vis.js library are very welcome! We can't do this alone!
Please submit your contribution to the respective project.

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

Copyright (C) 2010-2018 Almende B.V. and Contributors

Vis.js is dual licensed under both

  * The Apache 2.0 License
    http://www.apache.org/licenses/LICENSE-2.0

and

  * The MIT License
    http://opensource.org/licenses/MIT

Vis.js may be distributed under either license.
