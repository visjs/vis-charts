/**
 * @constructor Graph
 * Create a graph visualization, displaying nodes and edges.
 *
 * @param {Element} container   The DOM element in which the Graph will
 *                                  be created. Normally a div element.
 * @param {Object} data         An object containing parameters
 *                              {Array} nodes
 *                              {Array} edges
 * @param {Object} options      Options
 */
function Graph (container, data, options) {

  this._initializeMixinLoaders();

  // create variables and set default values
  this.containerElement = container;
  this.width = '100%';
  this.height = '100%';
  // to give everything a nice fluidity, we seperate the rendering and calculating of the forces
  this.renderRefreshRate = 60; // hz (fps)
  this.renderTimestep = 1000 / this.renderRefreshRate; // ms -- saves calculation later on
  this.stabilize = true; // stabilize before displaying the graph
  this.selectable = true;

  // set constant values
  this.constants = {
    nodes: {
      radiusMin: 5,
      radiusMax: 20,
      radius: 5,
      distance: 100,  // px
      shape: 'ellipse',
      image: undefined,
      widthMin: 16, // px
      widthMax: 64, // px
      fontColor: 'black',
      fontSize: 14, // px
      fontFace: 'verdana',
//      fontFace: 'arial',
      color: {
          border: '#2B7CE9',
          background: '#97C2FC',
        highlight: {
          border: '#2B7CE9',
          background: '#D2E5FF'
        }
      },
      borderColor: '#2B7CE9',
      backgroundColor: '#97C2FC',
      highlightColor: '#D2E5FF',
      group: undefined
    },
    edges: {
      widthMin: 1,
      widthMax: 15,
      width: 1,
      style: 'line',
      color: '#343434',
      fontColor: '#343434',
      fontSize: 14, // px
      fontFace: 'arial',
      //distance: 100, //px
      length: 100,   // px
      dash: {
        length: 10,
        gap: 5,
        altLength: undefined
      }
    },
    physics: {
      barnesHut: {
        enabled: true,
        theta: 1 / 0.3, // inverted to save time during calculation
        gravitationalConstant: -7500,
        centralGravity: 0.9,
        springLength: 25,
        springConstant: 0.05
      },
      repulsion: {
        centralGravity: 0.01,
        springLength: 60,
        springConstant: 0.05
      },
      centralGravity: null,
      springLength: null,
      springConstant: null
    },
    clustering: {                   // Per Node in Cluster = PNiC
      enabled: false,               // (Boolean)             | global on/off switch for clustering.
      initialMaxNodes: 100,         // (# nodes)             | if the initial amount of nodes is larger than this, we cluster until the total number is less than this threshold.
      clusterThreshold:500,         // (# nodes)             | during calculate forces, we check if the total number of nodes is larger than this. If it is, cluster until reduced to reduceToNodes
      reduceToNodes:300,            // (# nodes)             | during calculate forces, we check if the total number of nodes is larger than clusterThreshold. If it is, cluster until reduced to this
      chainThreshold: 0.4,          // (% of all drawn nodes)| maximum percentage of allowed chainnodes (long strings of connected nodes) within all nodes. (lower means less chains).
      clusterEdgeThreshold: 20,     // (px)                  | edge length threshold. if smaller, this node is clustered.
      sectorThreshold: 100,         // (# nodes in cluster)  | cluster size threshold. If larger, expanding in own sector.
      screenSizeThreshold: 0.2,     // (% of canvas)         | relative size threshold. If the width or height of a clusternode takes up this much of the screen, decluster node.
      fontSizeMultiplier: 4.0,      // (px PNiC)             | how much the cluster font size grows per node in cluster (in px).
      forceAmplification: 0.1,      // (multiplier PNiC)     | factor of increase fo the repulsion force of a cluster (per node in cluster).
      maxFontSize: 1000,
      distanceAmplification: 0.1,   // (multiplier PNiC)     | factor how much the repulsion distance of a cluster increases (per node in cluster).
      edgeGrowth: 1,               // (px PNiC)             | amount of clusterSize connected to the edge is multiplied with this and added to edgeLength.
      nodeScaling: {width:  1,      // (px PNiC)             | growth of the width  per node in cluster.
                    height: 1,      // (px PNiC)             | growth of the height per node in cluster.
                    radius: 1},     // (px PNiC)             | growth of the radius per node in cluster.
      maxNodeSizeIncrements: 600,   // (# increments)        | max growth of the width  per node in cluster.
      activeAreaBoxSize: 80,       // (px)                  | box area around the curser where clusters are popped open.
      clusterLevelDifference: 2
    },
    navigation: {
      enabled: false,
      iconPath: this._getScriptPath() + '/img'
    },
    keyboard: {
      enabled: false,
      speed: {x: 10, y: 10, zoom: 0.02}
    },
    dataManipulationToolbar: {
      enabled: false
    },
    smoothCurves: true,
    maxVelocity: 35,
    minVelocity: 0.1,   // px/s
    maxIterations: 1000  // maximum number of iteration to stabilize
  };

  // Node variables
  this.groups = new Groups(); // object with groups
  this.images = new Images(); // object with images
  this.images.setOnloadCallback(function () {
    graph._redraw();
  });

  // navigation variables
  this.xIncrement = 0;
  this.yIncrement = 0;
  this.zoomIncrement = 0;

  // load the force calculation functions, grouped under the physics system.
  this._loadPhysicsSystem();

  // create a frame and canvas
  this._create();

  // load the sector system.    (mandatory, fully integrated with Graph)
  this._loadSectorSystem();

  // load the cluster system.   (mandatory, even when not using the cluster system, there are function calls to it)
  this._loadClusterSystem();

  // load the selection system. (mandatory, required by Graph)
  this._loadSelectionSystem();

  // apply options
  this.setOptions(options);

  // other vars
  var graph = this;
  this.freezeSimulation = false;// freeze the simulation


  this.calculationNodes = {};
  this.calculationNodeIndices = [];
  this.nodeIndices = [];        // array with all the indices of the nodes. Used to speed up forces calculation
  this.nodes = {};              // object with Node objects
  this.edges = {};              // object with Edge objects

  this.canvasTopLeft     = {"x": 0,"y": 0};   // coordinates of the top left of the canvas.     they will be set during _redraw.
  this.canvasBottomRight = {"x": 0,"y": 0};   // coordinates of the bottom right of the canvas. they will be set during _redraw
  this.pointerPosition = {"x": 0,"y": 0};   // coordinates of the bottom right of the canvas. they will be set during _redraw

  this.areaCenter = {};               // object with x and y elements used for determining the center of the zoom action
  this.scale = 1;                     // defining the global scale variable in the constructor
  this.previousScale = this.scale;    // this is used to check if the zoom operation is zooming in or out
  // TODO: create a counter to keep track on the number of nodes having values
  // TODO: create a counter to keep track on the number of nodes currently moving
  // TODO: create a counter to keep track on the number of edges having values

  this.nodesData = null;      // A DataSet or DataView
  this.edgesData = null;      // A DataSet or DataView

  // create event listeners used to subscribe on the DataSets of the nodes and edges
  var me = this;
  this.nodesListeners = {
    'add': function (event, params) {
      me._addNodes(params.items);
      me.start();
    },
    'update': function (event, params) {
      me._updateNodes(params.items);
      me.start();
    },
    'remove': function (event, params) {
      me._removeNodes(params.items);
      me.start();
    }
  };
  this.edgesListeners = {
    'add': function (event, params) {
      me._addEdges(params.items);
      me.start();
    },
    'update': function (event, params) {
      me._updateEdges(params.items);
      me.start();
    },
    'remove': function (event, params) {
      me._removeEdges(params.items);
      me.start();
    }
  };

  // properties of the data
  this.moving = false;    // True if any of the nodes have an undefined position
  this.timer = undefined;


  // load data (the disable start variable will be the same as the enabled clustering)
  this.setData(data,this.constants.clustering.enabled);

  // zoom so all data will fit on the screen
  this.zoomToFit(true,this.constants.clustering.enabled);

  // if clustering is disabled, the simulation will have started in the setData function
  if (this.constants.clustering.enabled) {
    this.startWithClustering();
  }
}

/**
 * Get the script path where the vis.js library is located
 *
 * @returns {string | null} path   Path or null when not found. Path does not
 *                                 end with a slash.
 * @private
 */
Graph.prototype._getScriptPath = function() {
  var scripts = document.getElementsByTagName( 'script' );

  // find script named vis.js or vis.min.js
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;
    var match = src && /\/?vis(.min)?\.js$/.exec(src);
    if (match) {
      // return path without the script name
      return src.substring(0, src.length - match[0].length);
    }
  }

  return null;
};


/**
 * Find the center position of the graph
 * @private
 */
Graph.prototype._getRange = function() {
  var minY = 1e9, maxY = -1e9, minX = 1e9, maxX = -1e9, node;
  for (var i = 0; i < this.nodeIndices.length; i++) {
    node = this.nodes[this.nodeIndices[i]];
    if (minX > (node.x - node.width)) {minX = node.x - node.width;}
    if (maxX < (node.x + node.width)) {maxX = node.x + node.width;}
    if (minY > (node.y - node.height)) {minY = node.y - node.height;}
    if (maxY < (node.y + node.height)) {maxY = node.y + node.height;}
  }
  return {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
};


/**
 * @param {object} range = {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
 * @returns {{x: number, y: number}}
 * @private
 */
Graph.prototype._findCenter = function(range) {
  var center = {x: (0.5 * (range.maxX + range.minX)),
                y: (0.5 * (range.maxY + range.minY))};
  return center;
};


/**
 * center the graph
 *
 * @param {object} range = {minX: minX, maxX: maxX, minY: minY, maxY: maxY};
 */
Graph.prototype._centerGraph = function(range) {
  var center = this._findCenter(range);

  center.x *= this.scale;
  center.y *= this.scale;
  center.x -= 0.5 * this.frame.canvas.clientWidth;
  center.y -= 0.5 * this.frame.canvas.clientHeight;

  this._setTranslation(-center.x,-center.y); // set at 0,0
};


/**
 * This function zooms out to fit all data on screen based on amount of nodes
 *
 * @param {Boolean} [initialZoom]  | zoom based on fitted formula or range, true = fitted, default = false;
 */
Graph.prototype.zoomToFit = function(initialZoom, doNotStart) {
  if (initialZoom === undefined) {
    initialZoom = false;
  }

  var numberOfNodes = this.nodeIndices.length;
  var range = this._getRange();

  if (initialZoom == true) {
    if (this.constants.clustering.enabled == true &&
        numberOfNodes >= this.constants.clustering.initialMaxNodes) {
      var zoomLevel = 38.8467 / (numberOfNodes - 14.50184) + 0.0116; // this is obtained from fitting a dataset from 5 points with scale levels that looked good.
    }
    else {
      var zoomLevel = 42.54117319 / (numberOfNodes + 39.31966387) + 0.1944405; // this is obtained from fitting a dataset from 5 points with scale levels that looked good.
    }
  }
  else {
    var xDistance = (Math.abs(range.minX) + Math.abs(range.maxX)) * 1.1;
    var yDistance = (Math.abs(range.minY) + Math.abs(range.maxY)) * 1.1;

    var xZoomLevel = this.frame.canvas.clientWidth / xDistance;
    var yZoomLevel = this.frame.canvas.clientHeight / yDistance;

    zoomLevel = (xZoomLevel <= yZoomLevel) ? xZoomLevel : yZoomLevel;
  }

  if (zoomLevel > 1.0) {
    zoomLevel = 1.0;
  }

  this.pinch.mousewheelScale = zoomLevel;
  this._setScale(zoomLevel);
  this._centerGraph(range);
  if (doNotStart == false || doNotStart === undefined) {
    this.start();
  }
};


/**
 * Update the this.nodeIndices with the most recent node index list
 * @private
 */
Graph.prototype._updateNodeIndexList = function() {
  this._clearNodeIndexList();
  for (var idx in this.nodes) {
    if (this.nodes.hasOwnProperty(idx)) {
      this.nodeIndices.push(idx);
    }
  }
};


/**
 * Set nodes and edges, and optionally options as well.
 *
 * @param {Object} data              Object containing parameters:
 *                                   {Array | DataSet | DataView} [nodes] Array with nodes
 *                                   {Array | DataSet | DataView} [edges] Array with edges
 *                                   {String} [dot] String containing data in DOT format
 *                                   {Options} [options] Object with options
 * @param {Boolean} [disableStart]   | optional: disable the calling of the start function.
 */
Graph.prototype.setData = function(data, disableStart) {
  if (disableStart === undefined) {
    disableStart = false;
  }

  if (data && data.dot && (data.nodes || data.edges)) {
    throw new SyntaxError('Data must contain either parameter "dot" or ' +
        ' parameter pair "nodes" and "edges", but not both.');
  }

  // set options
  this.setOptions(data && data.options);

  // set all data
  if (data && data.dot) {
    // parse DOT file
    if(data && data.dot) {
      var dotData = vis.util.DOTToGraph(data.dot);
      this.setData(dotData);
      return;
    }
  }
  else {
    this._setNodes(data && data.nodes);
    this._setEdges(data && data.edges);
  }

  this._putDataInSector();

  if (!disableStart) {
    // find a stable position or start animating to a stable position
    if (this.stabilize) {
      this._doStabilize();
    }
    this.moving = true;
    this.start();
  }
};

/**
 * Set options
 * @param {Object} options
 */
Graph.prototype.setOptions = function (options) {
  if (options) {
    // retrieve parameter values
    if (options.width !== undefined)           {this.width = options.width;}
    if (options.height !== undefined)          {this.height = options.height;}
    if (options.stabilize !== undefined)       {this.stabilize = options.stabilize;}
    if (options.selectable !== undefined)      {this.selectable = options.selectable;}

    if (options.physics) {
      if (options.physics.barnesHut) {
        this.constants.physics.barnesHut.enabled = true;
        for (var prop in options.physics.barnesHut) {
          if (options.physics.barnesHut.hasOwnProperty(prop)) {
            this.constants.physics.barnesHut[prop] = options.physics.barnesHut[prop];
          }
        }
      }

      if (options.physics.repulsion) {
        this.constants.physics.barnesHut.enabled = false;
        for (var prop in options.physics.repulsion) {
          if (options.physics.repulsion.hasOwnProperty(prop)) {
            this.constants.physics.repulsion[prop] = options.physics.repulsion[prop];
          }
        }
      }
    }

    if (options.clustering) {
      this.constants.clustering.enabled = true;
      for (var prop in options.clustering) {
        if (options.clustering.hasOwnProperty(prop)) {
          this.constants.clustering[prop] = options.clustering[prop];
        }
      }
    }
    else if (options.clustering !== undefined)  {
      this.constants.clustering.enabled = false;
    }

    if (options.navigation) {
      this.constants.navigation.enabled = true;
      for (var prop in options.navigation) {
        if (options.navigation.hasOwnProperty(prop)) {
          this.constants.navigation[prop] = options.navigation[prop];
        }
      }
    }
    else if (options.navigation !== undefined) {
      this.constants.navigation.enabled = false;
    }

    if (options.keyboard) {
      this.constants.keyboard.enabled = true;
      for (var prop in options.keyboard) {
        if (options.keyboard.hasOwnProperty(prop)) {
          this.constants.keyboard[prop] = options.keyboard[prop];
        }
      }
    }
    else if (options.keyboard !== undefined)  {
      this.constants.keyboard.enabled = false;
    }

    if (options.dataManipulationToolbar) {
      this.constants.dataManipulationToolbar.enabled = true;
      for (var prop in options.dataManipulationToolbar) {
        if (options.dataManipulationToolbar.hasOwnProperty(prop)) {
          this.constants.dataManipulationToolbar[prop] = options.dataManipulationToolbar[prop];
        }
      }
    }
    else if (options.dataManipulationToolbar !== undefined)  {
      this.constants.dataManipulationToolbar.enabled = false;
    }

    // TODO: work out these options and document them
    if (options.edges) {
      for (prop in options.edges) {
        if (options.edges.hasOwnProperty(prop)) {
          this.constants.edges[prop] = options.edges[prop];
        }
      }

      if (options.edges.length !== undefined &&
          options.nodes && options.nodes.distance === undefined) {
        this.constants.edges.length   = options.edges.length;
        this.constants.nodes.distance = options.edges.length * 1.25;
      }

      if (!options.edges.fontColor) {
        this.constants.edges.fontColor = options.edges.color;
      }

      // Added to support dashed lines
      // David Jordan
      // 2012-08-08
      if (options.edges.dash) {
        if (options.edges.dash.length !== undefined) {
          this.constants.edges.dash.length = options.edges.dash.length;
        }
        if (options.edges.dash.gap !== undefined) {
          this.constants.edges.dash.gap = options.edges.dash.gap;
        }
        if (options.edges.dash.altLength !== undefined) {
          this.constants.edges.dash.altLength = options.edges.dash.altLength;
        }
      }
    }

    if (options.nodes) {
      for (prop in options.nodes) {
        if (options.nodes.hasOwnProperty(prop)) {
          this.constants.nodes[prop] = options.nodes[prop];
        }
      }

      if (options.nodes.color) {
        this.constants.nodes.color = Node.parseColor(options.nodes.color);
      }

      /*
       if (options.nodes.widthMin) this.constants.nodes.radiusMin = options.nodes.widthMin;
       if (options.nodes.widthMax) this.constants.nodes.radiusMax = options.nodes.widthMax;
       */
    }
    if (options.groups) {
      for (var groupname in options.groups) {
        if (options.groups.hasOwnProperty(groupname)) {
          var group = options.groups[groupname];
          this.groups.add(groupname, group);
        }
      }
    }
  }

  // load the force calculation functions, grouped under the physics system.
  this._loadPhysicsSystem();

  // load the navigation system.
  this._loadNavigationControls();

  // load the data manipulation system
  this._loadManipulationSystem();

  // bind keys. If disabled, this will not do anything;
  this._createKeyBinds();

  this.setSize(this.width, this.height);
  this._setTranslation(this.frame.clientWidth / 2, this.frame.clientHeight / 2);
  this._setScale(1);
  this._redraw();
};

/**
 * Add event listener
 * @param {String} event       Event name. Available events:
 *                             'select'
 * @param {function} callback  Callback function, invoked as callback(properties)
 *                             where properties is an optional object containing
 *                             event specific properties.
 */
Graph.prototype.on = function on (event, callback) {
  var available = ['select'];

  if (available.indexOf(event) == -1) {
    throw new Error('Unknown event "' + event + '". Choose from ' + available.join());
  }

  events.addListener(this, event, callback);
};

/**
 * Remove an event listener
 * @param {String} event       Event name
 * @param {function} callback  Callback function
 */
Graph.prototype.off = function off (event, callback) {
  events.removeListener(this, event, callback);
};

/**
 * fire an event
 * @param {String} event   The name of an event, for example 'select'
 * @param {Object} params  Optional object with event parameters
 * @private
 */
Graph.prototype._trigger = function (event, params) {
  events.trigger(this, event, params);
};


/**
 * Create the main frame for the Graph.
 * This function is executed once when a Graph object is created. The frame
 * contains a canvas, and this canvas contains all objects like the axis and
 * nodes.
 * @private
 */
Graph.prototype._create = function () {
  // remove all elements from the container element.
  while (this.containerElement.hasChildNodes()) {
    this.containerElement.removeChild(this.containerElement.firstChild);
  }

  this.frame = document.createElement('div');
  this.frame.className = 'graph-frame';
  this.frame.style.position = 'relative';
  this.frame.style.overflow = 'hidden';
  this.frame.style.zIndex = "1";

  // create the graph canvas (HTML canvas element)
  this.frame.canvas = document.createElement( 'canvas' );
  this.frame.canvas.style.position = 'relative';
  this.frame.appendChild(this.frame.canvas);
  if (!this.frame.canvas.getContext) {
    var noCanvas = document.createElement( 'DIV' );
    noCanvas.style.color = 'red';
    noCanvas.style.fontWeight =  'bold' ;
    noCanvas.style.padding =  '10px';
    noCanvas.innerHTML =  'Error: your browser does not support HTML canvas';
    this.frame.canvas.appendChild(noCanvas);
  }

  var me = this;
  this.drag = {};
  this.pinch = {};
  this.hammer = Hammer(this.frame.canvas, {
    prevent_default: true
  });
  this.hammer.on('tap',       me._onTap.bind(me) );
  this.hammer.on('doubletap', me._onDoubleTap.bind(me) );
  this.hammer.on('hold',      me._onHold.bind(me) );
  this.hammer.on('pinch',     me._onPinch.bind(me) );
  this.hammer.on('touch',     me._onTouch.bind(me) );
  this.hammer.on('dragstart', me._onDragStart.bind(me) );
  this.hammer.on('drag',      me._onDrag.bind(me) );
  this.hammer.on('dragend',   me._onDragEnd.bind(me) );
  this.hammer.on('release',   me._onRelease.bind(me) );
  this.hammer.on('mousewheel',me._onMouseWheel.bind(me) );
  this.hammer.on('DOMMouseScroll',me._onMouseWheel.bind(me) ); // for FF
  this.hammer.on('mousemove', me._onMouseMoveTitle.bind(me) );

  // add the frame to the container element
  this.containerElement.appendChild(this.frame);

};


/**
 * Binding the keys for keyboard navigation. These functions are defined in the NavigationMixin
 * @private
 */
Graph.prototype._createKeyBinds = function() {
  var me = this;
  this.mousetrap = mousetrap;

  this.mousetrap.reset();

  if (this.constants.keyboard.enabled == true) {
    this.mousetrap.bind("up",   this._moveUp.bind(me)   , "keydown");
    this.mousetrap.bind("up",   this._yStopMoving.bind(me), "keyup");
    this.mousetrap.bind("down", this._moveDown.bind(me) , "keydown");
    this.mousetrap.bind("down", this._yStopMoving.bind(me), "keyup");
    this.mousetrap.bind("left", this._moveLeft.bind(me) , "keydown");
    this.mousetrap.bind("left", this._xStopMoving.bind(me), "keyup");
    this.mousetrap.bind("right",this._moveRight.bind(me), "keydown");
    this.mousetrap.bind("right",this._xStopMoving.bind(me), "keyup");
    this.mousetrap.bind("=",    this._zoomIn.bind(me),    "keydown");
    this.mousetrap.bind("=",    this._stopZoom.bind(me),    "keyup");
    this.mousetrap.bind("-",    this._zoomOut.bind(me),   "keydown");
    this.mousetrap.bind("-",    this._stopZoom.bind(me),    "keyup");
    this.mousetrap.bind("[",    this._zoomIn.bind(me),    "keydown");
    this.mousetrap.bind("[",    this._stopZoom.bind(me),    "keyup");
    this.mousetrap.bind("]",    this._zoomOut.bind(me),   "keydown");
    this.mousetrap.bind("]",    this._stopZoom.bind(me),    "keyup");
    this.mousetrap.bind("pageup",this._zoomIn.bind(me),   "keydown");
    this.mousetrap.bind("pageup",this._stopZoom.bind(me),   "keyup");
    this.mousetrap.bind("pagedown",this._zoomOut.bind(me),"keydown");
    this.mousetrap.bind("pagedown",this._stopZoom.bind(me), "keyup");
  }
  this.mousetrap.bind("b",this._toggleBarnesHut.bind(me));

  if (this.constants.dataManipulationToolbar.enabled == true) {
    this.mousetrap.bind("escape",this._createManipulatorBar.bind(me));
  }
}

/**
 * Get the pointer location from a touch location
 * @param {{pageX: Number, pageY: Number}} touch
 * @return {{x: Number, y: Number}} pointer
 * @private
 */
Graph.prototype._getPointer = function (touch) {
  return {
    x: touch.pageX - vis.util.getAbsoluteLeft(this.frame.canvas),
    y: touch.pageY - vis.util.getAbsoluteTop(this.frame.canvas)
  };
};

/**
 * On start of a touch gesture, store the pointer
 * @param event
 * @private
 */
Graph.prototype._onTouch = function (event) {
  this.drag.pointer = this._getPointer(event.gesture.touches[0]);
  this.drag.pinched = false;
  this.pinch.scale = this._getScale();

  this._handleTouch(this.drag.pointer);
};

/**
 * handle drag start event
 * @private
 */
Graph.prototype._onDragStart = function () {
  var drag = this.drag;
  var node = this._getNodeAt(drag.pointer);
  // note: drag.pointer is set in _onTouch to get the initial touch location

  drag.dragging = true;
  drag.selection = [];
  drag.translation = this._getTranslation();
  drag.nodeId = null;

  if (node != null) {
    drag.nodeId = node.id;
    // select the clicked node if not yet selected
    if (!node.isSelected()) {
      this._selectObject(node,false);
    }

    // create an array with the selected nodes and their original location and status
    for (var objectId in this.selectionObj) {
      if (this.selectionObj.hasOwnProperty(objectId)) {
        var object = this.selectionObj[objectId];
        if (object instanceof Node) {
          var s = {
            id: object.id,
            node: object,

            // store original x, y, xFixed and yFixed, make the node temporarily Fixed
            x: object.x,
            y: object.y,
            xFixed: object.xFixed,
            yFixed: object.yFixed
          };

          object.xFixed = true;
          object.yFixed = true;

          drag.selection.push(s);
        }
      }
    }
  }
};

/**
 * handle drag event
 * @private
 */
Graph.prototype._onDrag = function (event) {
  if (this.drag.pinched) {
    return;
  }

  var pointer = this._getPointer(event.gesture.touches[0]);

  var me = this,
      drag = this.drag,
      selection = drag.selection;
  if (selection && selection.length) {
    // calculate delta's and new location
    var deltaX = pointer.x - drag.pointer.x,
        deltaY = pointer.y - drag.pointer.y;

    // update position of all selected nodes
    selection.forEach(function (s) {
      var node = s.node;

      if (!s.xFixed) {
        node.x = me._canvasToX(me._xToCanvas(s.x) + deltaX);
      }

      if (!s.yFixed) {
        node.y = me._canvasToY(me._yToCanvas(s.y) + deltaY);
      }
    });

    // start animation if not yet running
    if (!this.moving) {
      this.moving = true;
      this.start();
    }
  }
  else {
    // move the graph
    var diffX = pointer.x - this.drag.pointer.x;
    var diffY = pointer.y - this.drag.pointer.y;

    this._setTranslation(
        this.drag.translation.x + diffX,
        this.drag.translation.y + diffY);
    this._redraw();
    this.moved = true;
  }
};

/**
 * handle drag start event
 * @private
 */
Graph.prototype._onDragEnd = function () {
  this.drag.dragging = false;
  var selection = this.drag.selection;
  if (selection) {
    selection.forEach(function (s) {
      // restore original xFixed and yFixed
      s.node.xFixed = s.xFixed;
      s.node.yFixed = s.yFixed;
    });
  }
};

/**
 * handle tap/click event: select/unselect a node
 * @private
 */
Graph.prototype._onTap = function (event) {
  var pointer = this._getPointer(event.gesture.touches[0]);
  this.pointerPosition = pointer;
  this._handleTap(pointer);

};


/**
 * handle doubletap event
 * @private
 */
Graph.prototype._onDoubleTap = function (event) {
  var pointer = this._getPointer(event.gesture.touches[0]);
  this._handleDoubleTap(pointer);

};


/**
 * handle long tap event: multi select nodes
 * @private
 */
Graph.prototype._onHold = function (event) {
  var pointer = this._getPointer(event.gesture.touches[0]);
  this.pointerPosition = pointer;
  this._handleOnHold(pointer);
};

/**
 * handle the release of the screen
 *
 * @param event
 * @private
 */
Graph.prototype._onRelease = function (event) {
  this._handleOnRelease();
};

/**
 * Handle pinch event
 * @param event
 * @private
 */
Graph.prototype._onPinch = function (event) {
  var pointer = this._getPointer(event.gesture.center);

  this.drag.pinched = true;
  if (!('scale' in this.pinch)) {
    this.pinch.scale = 1;
  }

  // TODO: enabled moving while pinching?
  var scale = this.pinch.scale * event.gesture.scale;
  this._zoom(scale, pointer)
};

/**
 * Zoom the graph in or out
 * @param {Number} scale a number around 1, and between 0.01 and 10
 * @param {{x: Number, y: Number}} pointer    Position on screen
 * @return {Number} appliedScale    scale is limited within the boundaries
 * @private
 */
Graph.prototype._zoom = function(scale, pointer) {
  var scaleOld = this._getScale();
  if (scale < 0.00001) {
    scale = 0.00001;
  }
  if (scale > 10) {
    scale = 10;
  }
// + this.frame.canvas.clientHeight / 2
  var translation = this._getTranslation();

  var scaleFrac = scale / scaleOld;
  var tx = (1 - scaleFrac) * pointer.x + translation.x * scaleFrac;
  var ty = (1 - scaleFrac) * pointer.y + translation.y * scaleFrac;

  this.areaCenter = {"x" : this._canvasToX(pointer.x),
                     "y" : this._canvasToY(pointer.y)};

 // this.areaCenter = {"x" : pointer.x,"y" : pointer.y };
//  console.log(translation.x,translation.y,pointer.x,pointer.y,scale);
  this.pinch.mousewheelScale = scale;
  this._setScale(scale);
  this._setTranslation(tx, ty);
  this.updateClustersDefault();
  this._redraw();

  return scale;
};

/**
 * Event handler for mouse wheel event, used to zoom the timeline
 * See http://adomas.org/javascript-mouse-wheel/
 *     https://github.com/EightMedia/hammer.js/issues/256
 * @param {MouseEvent}  event
 * @private
 */
Graph.prototype._onMouseWheel = function(event) {
  // retrieve delta
  var delta = 0;
  if (event.wheelDelta) { /* IE/Opera. */
    delta = event.wheelDelta/120;
  } else if (event.detail) { /* Mozilla case. */
    // In Mozilla, sign of delta is different than in IE.
    // Also, delta is multiple of 3.
    delta = -event.detail/3;
  }

  // If delta is nonzero, handle it.
  // Basically, delta is now positive if wheel was scrolled up,
  // and negative, if wheel was scrolled down.
  if (delta) {
    if (!('mousewheelScale' in this.pinch)) {
      this.pinch.mousewheelScale = 1;
    }

    // calculate the new scale
    var scale = this.pinch.mousewheelScale;
    var zoom = delta / 10;
    if (delta < 0) {
      zoom = zoom / (1 - zoom);
    }
    scale *= (1 + zoom);

    // calculate the pointer location
    var gesture = util.fakeGesture(this, event);
    var pointer = this._getPointer(gesture.center);

    // apply the new scale
    scale = this._zoom(scale, pointer);

    // store the new, applied scale -- this is now done in _zoom
//    this.pinch.mousewheelScale = scale;
  }

  // Prevent default actions caused by mouse wheel.
  event.preventDefault();
};


/**
 * Mouse move handler for checking whether the title moves over a node with a title.
 * @param  {Event} event
 * @private
 */
Graph.prototype._onMouseMoveTitle = function (event) {
  var gesture = util.fakeGesture(this, event);
  var pointer = this._getPointer(gesture.center);

  // check if the previously selected node is still selected
  if (this.popupNode) {
    this._checkHidePopup(pointer);
  }

  // start a timeout that will check if the mouse is positioned above
  // an element
  var me = this;
  var checkShow = function() {
    me._checkShowPopup(pointer);
  };
  if (this.popupTimer) {
    clearInterval(this.popupTimer); // stop any running calculationTimer
  }
  if (!this.drag.dragging) {
    this.popupTimer = setTimeout(checkShow, 300);
  }
};

/**
 * Check if there is an element on the given position in the graph
 * (a node or edge). If so, and if this element has a title,
 * show a popup window with its title.
 *
 * @param {{x:Number, y:Number}} pointer
 * @private
 */
Graph.prototype._checkShowPopup = function (pointer) {
  var obj = {
    left:   this._canvasToX(pointer.x),
    top:    this._canvasToY(pointer.y),
    right:  this._canvasToX(pointer.x),
    bottom: this._canvasToY(pointer.y)
  };

  var id;
  var lastPopupNode = this.popupNode;

  if (this.popupNode == undefined) {
    // search the nodes for overlap, select the top one in case of multiple nodes
    var nodes = this.nodes;
    for (id in nodes) {
      if (nodes.hasOwnProperty(id)) {
        var node = nodes[id];
        if (node.getTitle() !== undefined && node.isOverlappingWith(obj)) {
          this.popupNode = node;
          break;
        }
      }
    }
  }

  if (this.popupNode === undefined) {
    // search the edges for overlap
    var edges = this.edges;
    for (id in edges) {
      if (edges.hasOwnProperty(id)) {
        var edge = edges[id];
        if (edge.connected && (edge.getTitle() !== undefined) &&
            edge.isOverlappingWith(obj)) {
          this.popupNode = edge;
          break;
        }
      }
    }
  }

  if (this.popupNode) {
    // show popup message window
    if (this.popupNode != lastPopupNode) {
      var me = this;
      if (!me.popup) {
        me.popup = new Popup(me.frame);
      }

      // adjust a small offset such that the mouse cursor is located in the
      // bottom left location of the popup, and you can easily move over the
      // popup area
      me.popup.setPosition(pointer.x - 3, pointer.y - 3);
      me.popup.setText(me.popupNode.getTitle());
      me.popup.show();
    }
  }
  else {
    if (this.popup) {
      this.popup.hide();
    }
  }
};

/**
 * Check if the popup must be hided, which is the case when the mouse is no
 * longer hovering on the object
 * @param {{x:Number, y:Number}} pointer
 * @private
 */
Graph.prototype._checkHidePopup = function (pointer) {
  if (!this.popupNode || !this._getNodeAt(pointer) ) {
    this.popupNode = undefined;
    if (this.popup) {
      this.popup.hide();
    }
  }
};


/**
 * Temporary method to test calculating a hub value for the nodes
 * @param {number} level        Maximum number edges between two nodes in order
 *                              to call them connected. Optional, 1 by default
 * @return {Number[]} connectioncount array with the connection count
 *                                    for each node
 * @private
 */
Graph.prototype._getConnectionCount = function(level) {
  if (level == undefined) {
    level = 1;
  }

  // get the nodes connected to given nodes
  function getConnectedNodes(nodes) {
    var connectedNodes = [];

    for (var j = 0, jMax = nodes.length; j < jMax; j++) {
      var node = nodes[j];

      // find all nodes connected to this node
      var edges = node.edges;
      for (var i = 0, iMax = edges.length; i < iMax; i++) {
        var edge = edges[i];
        var other = null;

        // check if connected
        if (edge.from == node)
          other = edge.to;
        else if (edge.to == node)
          other = edge.from;

        // check if the other node is not already in the list with nodes
        var k, kMax;
        if (other) {
          for (k = 0, kMax = nodes.length; k < kMax; k++) {
            if (nodes[k] == other) {
              other = null;
              break;
            }
          }
        }
        if (other) {
          for (k = 0, kMax = connectedNodes.length; k < kMax; k++) {
            if (connectedNodes[k] == other) {
              other = null;
              break;
            }
          }
        }

        if (other)
          connectedNodes.push(other);
      }
    }

    return connectedNodes;
  }

  var connections = [];
  var nodes = this.nodes;
  for (var id in nodes) {
    if (nodes.hasOwnProperty(id)) {
      var c = [nodes[id]];
      for (var l = 0; l < level; l++) {
        c = c.concat(getConnectedNodes(c));
      }
      connections.push(c);
    }
  }

  var hubs = [];
  for (var i = 0, len = connections.length; i < len; i++) {
    hubs.push(connections[i].length);
  }

  return hubs;
};

/**
 * Set a new size for the graph
 * @param {string} width   Width in pixels or percentage (for example '800px'
 *                         or '50%')
 * @param {string} height  Height in pixels or percentage  (for example '400px'
 *                         or '30%')
 */
Graph.prototype.setSize = function(width, height) {
  this.frame.style.width = width;
  this.frame.style.height = height;

  this.frame.canvas.style.width = '100%';
  this.frame.canvas.style.height = '100%';

  this.frame.canvas.width = this.frame.canvas.clientWidth;
  this.frame.canvas.height = this.frame.canvas.clientHeight;

  if (this.manipulationDiv !== undefined) {
    this.manipulationDiv.style.width = this.frame.canvas.clientWidth;
  }

  if (this.constants.navigation.enabled == true) {
    this._relocateNavigation();
  }
};

/**
 * Set a data set with nodes for the graph
 * @param {Array | DataSet | DataView} nodes         The data containing the nodes.
 * @private
 */
Graph.prototype._setNodes = function(nodes) {
  var oldNodesData = this.nodesData;

  if (nodes instanceof DataSet || nodes instanceof DataView) {
    this.nodesData = nodes;
  }
  else if (nodes instanceof Array) {
    this.nodesData = new DataSet();
    this.nodesData.add(nodes);
  }
  else if (!nodes) {
    this.nodesData = new DataSet();
  }
  else {
    throw new TypeError('Array or DataSet expected');
  }

  if (oldNodesData) {
    // unsubscribe from old dataset
    util.forEach(this.nodesListeners, function (callback, event) {
      oldNodesData.unsubscribe(event, callback);
    });
  }

  // remove drawn nodes
  this.nodes = {};

  if (this.nodesData) {
    // subscribe to new dataset
    var me = this;
    util.forEach(this.nodesListeners, function (callback, event) {
      me.nodesData.subscribe(event, callback);
    });

    // draw all new nodes
    var ids = this.nodesData.getIds();
    this._addNodes(ids);
  }
  this._updateSelection();
};

/**
 * Add nodes
 * @param {Number[] | String[]} ids
 * @private
 */
Graph.prototype._addNodes = function(ids) {
  var id;
  for (var i = 0, len = ids.length; i < len; i++) {
    id = ids[i];
    var data = this.nodesData.get(id);
    var node = new Node(data, this.images, this.groups, this.constants);
    this.nodes[id] = node; // note: this may replace an existing node

    if ((node.xFixed == false || node.yFixed == false) && this.createNodeOnClick != true) {
      var radius = this.constants.physics.springLength * 0.1*ids.length;
      var angle = 2 * Math.PI * Math.random();
      if (node.xFixed == false) {node.x = radius * Math.cos(angle);}
      if (node.yFixed == false) {node.y = radius * Math.sin(angle);}

      // note: no not use node.isMoving() here, as that gives the current
      // velocity of the node, which is zero after creation of the node.
      this.moving = true;
    }
  }
  this._updateNodeIndexList();
  this._reconnectEdges();
  this._updateValueRange(this.nodes);
  this.updateLabels();
};

/**
 * Update existing nodes, or create them when not yet existing
 * @param {Number[] | String[]} ids
 * @private
 */
Graph.prototype._updateNodes = function(ids) {
  var nodes = this.nodes,
      nodesData = this.nodesData;
  for (var i = 0, len = ids.length; i < len; i++) {
    var id = ids[i];
    var node = nodes[id];
    var data = nodesData.get(id);
    if (node) {
      // update node
      node.setProperties(data, this.constants);
    }
    else {
      // create node
      node = new Node(properties, this.images, this.groups, this.constants);
      nodes[id] = node;

      if (!node.isFixed()) {
        this.moving = true;
      }
    }
  }
  this._updateNodeIndexList();
  this._reconnectEdges();
  this._updateValueRange(nodes);
};

/**
 * Remove existing nodes. If nodes do not exist, the method will just ignore it.
 * @param {Number[] | String[]} ids
 * @private
 */
Graph.prototype._removeNodes = function(ids) {
  var nodes = this.nodes;
  for (var i = 0, len = ids.length; i < len; i++) {
    var id = ids[i];
    delete nodes[id];
  }
  this._updateNodeIndexList();
  this._reconnectEdges();
  this._updateSelection();
  this._updateValueRange(nodes);
};

/**
 * Load edges by reading the data table
 * @param {Array | DataSet | DataView} edges    The data containing the edges.
 * @private
 * @private
 */
Graph.prototype._setEdges = function(edges) {
  var oldEdgesData = this.edgesData;

  if (edges instanceof DataSet || edges instanceof DataView) {
    this.edgesData = edges;
  }
  else if (edges instanceof Array) {
    this.edgesData = new DataSet();
    this.edgesData.add(edges);
  }
  else if (!edges) {
    this.edgesData = new DataSet();
  }
  else {
    throw new TypeError('Array or DataSet expected');
  }

  if (oldEdgesData) {
    // unsubscribe from old dataset
    util.forEach(this.edgesListeners, function (callback, event) {
      oldEdgesData.unsubscribe(event, callback);
    });
  }

  // remove drawn edges
  this.edges = {};

  if (this.edgesData) {
    // subscribe to new dataset
    var me = this;
    util.forEach(this.edgesListeners, function (callback, event) {
      me.edgesData.subscribe(event, callback);
    });

    // draw all new nodes
    var ids = this.edgesData.getIds();
    this._addEdges(ids);
  }

  this._reconnectEdges();
};

/**
 * Add edges
 * @param {Number[] | String[]} ids
 * @private
 */
Graph.prototype._addEdges = function (ids) {
  var edges = this.edges,
      edgesData = this.edgesData;

  for (var i = 0, len = ids.length; i < len; i++) {
    var id = ids[i];

    var oldEdge = edges[id];
    if (oldEdge) {
      oldEdge.disconnect();
    }

    var data = edgesData.get(id, {"showInternalIds" : true});
    edges[id] = new Edge(data, this, this.constants);
  }

  this.moving = true;
  this._updateValueRange(edges);
  this._createBezierNodes();
};

/**
 * Update existing edges, or create them when not yet existing
 * @param {Number[] | String[]} ids
 * @private
 */
Graph.prototype._updateEdges = function (ids) {
  var edges = this.edges,
      edgesData = this.edgesData;
  for (var i = 0, len = ids.length; i < len; i++) {
    var id = ids[i];

    var data = edgesData.get(id);
    var edge = edges[id];
    if (edge) {
      // update edge
      edge.disconnect();
      edge.setProperties(data, this.constants);
      edge.connect();
    }
    else {
      // create edge
      edge = new Edge(data, this, this.constants);
      this.edges[id] = edge;
    }
  }

  this._createBezierNodes();
  this.moving = true;
  this._updateValueRange(edges);
};

/**
 * Remove existing edges. Non existing ids will be ignored
 * @param {Number[] | String[]} ids
 * @private
 */
Graph.prototype._removeEdges = function (ids) {
  var edges = this.edges;
  for (var i = 0, len = ids.length; i < len; i++) {
    var id = ids[i];
    var edge = edges[id];
    if (edge) {
      if (edge.via != null) {
        delete this.sectors['support']['nodes'][edge.via.id];
      }
      edge.disconnect();
      delete edges[id];
    }
  }

  this.moving = true;
  this._updateValueRange(edges);
  this._setCalculationNodes();
};

/**
 * Reconnect all edges
 * @private
 */
Graph.prototype._reconnectEdges = function() {
  var id,
      nodes = this.nodes,
      edges = this.edges;
  for (id in nodes) {
    if (nodes.hasOwnProperty(id)) {
      nodes[id].edges = [];
    }
  }

  for (id in edges) {
    if (edges.hasOwnProperty(id)) {
      var edge = edges[id];
      edge.from = null;
      edge.to = null;
      edge.connect();
    }
  }
};

/**
 * Update the values of all object in the given array according to the current
 * value range of the objects in the array.
 * @param {Object} obj    An object containing a set of Edges or Nodes
 *                        The objects must have a method getValue() and
 *                        setValueRange(min, max).
 * @private
 */
Graph.prototype._updateValueRange = function(obj) {
  var id;

  // determine the range of the objects
  var valueMin = undefined;
  var valueMax = undefined;
  for (id in obj) {
    if (obj.hasOwnProperty(id)) {
      var value = obj[id].getValue();
      if (value !== undefined) {
        valueMin = (valueMin === undefined) ? value : Math.min(value, valueMin);
        valueMax = (valueMax === undefined) ? value : Math.max(value, valueMax);
      }
    }
  }

  // adjust the range of all objects
  if (valueMin !== undefined && valueMax !== undefined) {
    for (id in obj) {
      if (obj.hasOwnProperty(id)) {
        obj[id].setValueRange(valueMin, valueMax);
      }
    }
  }
};

/**
 * Redraw the graph with the current data
 * chart will be resized too.
 */
Graph.prototype.redraw = function() {
  this.setSize(this.width, this.height);

  this._redraw();
};

/**
 * Redraw the graph with the current data
 * @private
 */
Graph.prototype._redraw = function() {
  var ctx = this.frame.canvas.getContext('2d');
  // clear the canvas
  var w = this.frame.canvas.width;
  var h = this.frame.canvas.height;
  ctx.clearRect(0, 0, w, h);

  // set scaling and translation
  ctx.save();
  ctx.translate(this.translation.x, this.translation.y);
  ctx.scale(this.scale, this.scale);

  this.canvasTopLeft = {
    "x": this._canvasToX(0),
    "y": this._canvasToY(0)
  };
  this.canvasBottomRight = {
    "x": this._canvasToX(this.frame.canvas.clientWidth),
    "y": this._canvasToY(this.frame.canvas.clientHeight)
  };

  this._doInAllSectors("_drawAllSectorNodes",ctx);
  this._doInAllSectors("_drawEdges",ctx);
  this._doInAllSectors("_drawNodes",ctx,false);

//  this._doInSupportSector("_drawNodes",ctx,true);
//  this._drawTree(ctx,"#F00F0F");

  // restore original scaling and translation
  ctx.restore();

  if (this.constants.navigation.enabled == true) {
    this._doInNavigationSector("_drawNodes",ctx,true);
  }
};

/**
 * Set the translation of the graph
 * @param {Number} offsetX    Horizontal offset
 * @param {Number} offsetY    Vertical offset
 * @private
 */
Graph.prototype._setTranslation = function(offsetX, offsetY) {
  if (this.translation === undefined) {
    this.translation = {
      x: 0,
      y: 0
    };
  }

  if (offsetX !== undefined) {
    this.translation.x = offsetX;
  }
  if (offsetY !== undefined) {
    this.translation.y = offsetY;
  }
};

/**
 * Get the translation of the graph
 * @return {Object} translation    An object with parameters x and y, both a number
 * @private
 */
Graph.prototype._getTranslation = function() {
  return {
    x: this.translation.x,
    y: this.translation.y
  };
};

/**
 * Scale the graph
 * @param {Number} scale   Scaling factor 1.0 is unscaled
 * @private
 */
Graph.prototype._setScale = function(scale) {
  this.scale = scale;
};

/**
 * Get the current scale of  the graph
 * @return {Number} scale   Scaling factor 1.0 is unscaled
 * @private
 */
Graph.prototype._getScale = function() {
  return this.scale;
};

/**
 * Convert a horizontal point on the HTML canvas to the x-value of the model
 * @param {number} x
 * @returns {number}
 * @private
 */
Graph.prototype._canvasToX = function(x) {
  return (x - this.translation.x) / this.scale;
};

/**
 * Convert an x-value in the model to a horizontal point on the HTML canvas
 * @param {number} x
 * @returns {number}
 * @private
 */
Graph.prototype._xToCanvas = function(x) {
  return x * this.scale + this.translation.x;
};

/**
 * Convert a vertical point on the HTML canvas to the y-value of the model
 * @param {number} y
 * @returns {number}
 * @private
 */
Graph.prototype._canvasToY = function(y) {
  return (y - this.translation.y) / this.scale;
};

/**
 * Convert an y-value in the model to a vertical point on the HTML canvas
 * @param {number} y
 * @returns {number}
 * @private
 */
Graph.prototype._yToCanvas = function(y) {
  return y * this.scale + this.translation.y ;
};

/**
 * Redraw all nodes
 * The 2d context of a HTML canvas can be retrieved by canvas.getContext('2d');
 * @param {CanvasRenderingContext2D}   ctx
 * @param {Boolean} [alwaysShow]
 * @private
 */
Graph.prototype._drawNodes = function(ctx,alwaysShow) {
  if (alwaysShow === undefined) {
    alwaysShow = false;
  }
  // first draw the unselected nodes
  var nodes = this.nodes;
  var selected = [];

  for (var id in nodes) {
    if (nodes.hasOwnProperty(id)) {
      nodes[id].setScaleAndPos(this.scale,this.canvasTopLeft,this.canvasBottomRight);
      if (nodes[id].isSelected()) {
        selected.push(id);
      }
      else {
        if (nodes[id].inArea() || alwaysShow) {
          nodes[id].draw(ctx);
        }
      }
    }
  }

  // draw the selected nodes on top
  for (var s = 0, sMax = selected.length; s < sMax; s++) {
    if (nodes[selected[s]].inArea() || alwaysShow) {
      nodes[selected[s]].draw(ctx);
    }
  }
};

/**
 * Redraw all edges
 * The 2d context of a HTML canvas can be retrieved by canvas.getContext('2d');
 * @param {CanvasRenderingContext2D}   ctx
 * @private
 */
Graph.prototype._drawEdges = function(ctx) {
  var edges = this.edges;
  for (var id in edges) {
    if (edges.hasOwnProperty(id)) {
      var edge = edges[id];
      edge.setScale(this.scale);
      if (edge.connected) {
        edges[id].draw(ctx);
      }
    }
  }
};

/**
 * Find a stable position for all nodes
 * @private
 */
Graph.prototype._doStabilize = function() {
  //var start = new Date();

  // find stable position
  var count = 0;
  var vmin = this.constants.minVelocity;
  var stable = false;
  while (!stable && count < this.constants.maxIterations) {
    this._initializeForceCalculation();
    this._discreteStepNodes();
    stable = !this._isMoving(vmin);
    count++;
  }
  this.zoomToFit();
};




/**
 * Check if any of the nodes is still moving
 * @param {number} vmin   the minimum velocity considered as 'moving'
 * @return {boolean}      true if moving, false if non of the nodes is moving
 * @private
 */
Graph.prototype._isMoving = function(vmin) {
  var nodes = this.nodes;
  for (var id in nodes) {
    if (nodes.hasOwnProperty(id) && nodes[id].isMoving(vmin)) {
      return true;
    }
  }
  return false;
};


/**
 * /**
 * Perform one discrete step for all nodes
 *
 * @param interval
 * @private
 */
Graph.prototype._discreteStepNodes = function() {
  var interval = 1.0;
  var nodes = this.nodes;

  if (this.constants.maxVelocity > 0) {
    for (var id in nodes) {
      if (nodes.hasOwnProperty(id)) {
        nodes[id].discreteStepLimited(interval, this.constants.maxVelocity);
      }
    }
  }
  else {
    for (var id in nodes) {
      if (nodes.hasOwnProperty(id)) {
        nodes[id].discreteStep(interval);
      }
    }
  }
  var vminCorrected = this.constants.minVelocity / Math.max(this.scale,0.05);
  if (vminCorrected > 0.5*this.constants.maxVelocity) {
    this.moving = true;
  }
  else {
    this.moving = this._isMoving(vminCorrected);
  }
};



/**
 * Start animating nodes and edges
 *
 * @poram {Boolean} runCalculationStep
 */
Graph.prototype.start = function() {
  if (!this.freezeSimulation) {

    if (this.moving) {
      this._doInAllActiveSectors("_initializeForceCalculation");
      this._doInAllActiveSectors("_discreteStepNodes");
      if (this.constants.smoothCurves) {
        this._doInSupportSector("_discreteStepNodes");
      }
      this._findCenter(this._getRange())
    }

    if (this.moving || this.xIncrement != 0 || this.yIncrement != 0 || this.zoomIncrement != 0) {
      // start animation. only start calculationTimer if it is not already running
      if (!this.timer) {
        var graph = this;
        this.timer = window.setTimeout(function () {
          graph.timer = undefined;

          // keyboad movement
          if (graph.xIncrement != 0 || graph.yIncrement != 0) {
            var translation = graph._getTranslation();
            graph._setTranslation(translation.x+graph.xIncrement, translation.y+graph.yIncrement);
          }
          if (graph.zoomIncrement != 0) {
            var center = {
              x: graph.frame.canvas.clientWidth / 2,
              y: graph.frame.canvas.clientHeight / 2
            };
            graph._zoom(graph.scale*(1 + graph.zoomIncrement), center);
          }

//          var calctimeStart = Date.now();

          graph.start();
          graph.start();

//          var calctime = Date.now() - calctimeStart;
//          var rendertimeStart = Date.now();
          graph._redraw();
//          var rendertime = Date.now() - rendertimeStart;

          //this.end = window.performance.now();
          //this.time = this.end - this.startTime;
          //console.log('refresh time: ' + this.time);
          //this.startTime = window.performance.now();
//          var DOMelement = document.getElementById("calctimereporter");
//          if (DOMelement !== undefined) {
//            DOMelement.innerHTML = calctime;
//          }
//          DOMelement = document.getElementById("rendertimereporter");
//          if (DOMelement !== undefined) {
//            DOMelement.innerHTML = rendertime;
//          }
        }, this.renderTimestep);
      }
    }
    else {
      this._redraw();
    }
  }
};

/**
 * Debug function, does one step of the graph
 */
Graph.prototype.singleStep = function() {
  if (this.moving) {
    this._initializeForceCalculation();
    this._discreteStepNodes();

    var vmin = this.constants.minVelocity;
    this.moving = this._isMoving(vmin);
    this._redraw();
  }
};



/**
 *  Freeze the animation
 */
Graph.prototype.toggleFreeze = function() {
  if (this.freezeSimulation == false) {
    this.freezeSimulation = true;
  }
  else {
    this.freezeSimulation = false;
    this.start();
  }
};


Graph.prototype._createBezierNodes = function() {
  if (this.constants.smoothCurves == true) {
    for (var edgeId in this.edges) {
      if (this.edges.hasOwnProperty(edgeId)) {
        var edge = this.edges[edgeId];
        if (edge.smooth == true) {
          if (edge.via == null) {
            var nodeId = "edgeId:".concat(edge.id);
            this.sectors['support']['nodes'][nodeId] = new Node(
                    {id:nodeId,
                      mass:1,
                      shape:'circle',
                      internalMultiplier:1,
                      damping: 1},{},{},this.constants);
            edge.via = this.sectors['support']['nodes'][nodeId];
            edge.via.parentEdgeId = edge.id;
            edge.positionBezierNode();
          }
        }
      }
    }
  }
};


Graph.prototype._initializeMixinLoaders = function () {
  for (var mixinFunction in graphMixinLoaders) {
    if (graphMixinLoaders.hasOwnProperty(mixinFunction)) {
      Graph.prototype[mixinFunction] = graphMixinLoaders[mixinFunction];
    }
  }
}



















