import charts from './rollup.config.charts'
import data from './rollup.config.data'
import graph3D from './rollup.config.graph3d'
import network from './rollup.config.network'
import timelineGraph2D from './rollup.config.timeline-graph2d'

export default [
	...charts,
	...data,
	...graph3D,
	...network,
	...timelineGraph2D,
]
