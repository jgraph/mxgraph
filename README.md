mxGraph
=======

mxGraph is a fully client side JavaScript diagramming library that uses SVG and HTML for rendering. [diagrams.net](https://app.diagrams.net) is our production-grade example that demonstrates extending the functionality of this library and how to deploy it in a secure, scalable manner. The [sources to diagrams.net](https://github.com/jgraph/draw.io) are also available.

Note this is the release repo, only each release is pushed here. The development repo is https://github.com/jgraph/mxgraph2,  submit PRs there.

The PHP model was deprecated after release 4.0.3 and the archive can be found [here](https://github.com/jgraph/mxgraph-php).

If you want to build something like diagrams.net, [GraphEditor](https://jgraph.github.io/mxgraph/javascript/examples/grapheditor/www/index.html) is the best example to use as a base.

The npm build is [here](https://www.npmjs.com/package/mxgraph)

We don't support Typescript, but there is a [project to implement this](https://github.com/process-analytics/mxgraph-road-to-DefinitelyTyped), with [this repo](https://github.com/hungtcs/mxgraph-type-definitions) currently used as the lead repo.

mxGraph supports IE 11, Chrome 43+, Firefox 45+, Safari 10 and later, Opera 30+, Native Android browser 5.1.x+, the default browser in the current and previous major iOS versions (e.g. 13.x and 12.x) and Edge 31+.

The mxGraph library uses no third-party software, it requires no plugins and can be integrated in virtually any framework (it's vanilla JS).

Getting Started
===============

In the root folder there is an index.html file that contains links to all resources. You can view the documentation online on the [Github pages branch](https://jgraph.github.io/mxgraph/). The key resources are the JavaScript user manual, the JavaScript examples and the JavaScript API specificiation.

Support
=======

There is a [mxgraph tag on Stack Overflow](http://stackoverflow.com/questions/tagged/mxgraph). Please ensure your questions adhere to the [SO guidelines](http://stackoverflow.com/help/on-topic), otherwise it is likely to be closed.

You may post on the issues tracker on this Github project, but we do not actively answer support questions. Issues most likely to interest us are clearly explained bugs in the core library and pull requests with a clear explaination of what they are fixing and how.

We do not support the .NET and Java rendering functionality at all, the source code is just included in the repo for completeness. Non JavaScript rendering questions will be closed and pointed at this README.

If you are looking for active support, your better route is one of the commercial diagramming tools, like yFiles or GoJS.

License
=======

mxGraph is licensed under the Apache 2.0 license. We do not sell any other license, nor do we have an option for paid support.

History
=======

We created mxGraph in 2005 as a commercial project and it ran through to 2016 that way. Our USP was the support for non-SVG browsers, when that advantage expired we moved onto commercial activity around draw.io. mxGraph is pretty much feature complete, production tested in many large enterprises and stable for many years. We actively fix bugs and add features specific to our needs in diagrams.net.
