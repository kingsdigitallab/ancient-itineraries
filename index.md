
As a part of work undertaken during the Ancient Itineraries project, King's Digital Lab developed implementations of the models that had been designed to accomodate the key concepts and the nuances of the life cycle and metakinetic journeys of art.

## Data model

A [description](data-design.html) of the development of the data model implemented in Neo4J, building on the case studies examined in the institutes.

## Setting up Neo4J sample data

[Getting started](neo4j-setup.html)

## Interactive online visualisations

The case study of The Dancing Faun was selected to build a prototype implementation of the data structure designed during the Institutes. Using [3D Force Graph](https://github.com/vasturiano/3d-force-graph), the node structure is rendered in the browser with colour coding for node and relationship types.
Nodes may be dragged and rearranged, and any assocaited URI will open in a new browser window. Directionality in relatioships between nodes can be animated. The relative importance of each node in the metakinetic journey is indicated by variation in size which has been derived from the [page rank](https://neo4j.com/docs/graph-data-science/current/algorithms/page-rank/) algorithm.

[The Dancing Faun graph](views/graph.html)

## VR Visualisation

The database was converted to a JSON format that can be accepted by the noda.io mind-mapping software, for use in VR. The file can be downloaded [here](data/processed/DancinFaun_NODA.json) 
