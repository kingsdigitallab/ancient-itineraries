CALL gds.graph.create('rank-graph', '*', '*');

CALL gds.pageRank.write('rank-graph', {
  maxIterations: 20,
  dampingFactor: 0.85,
  writeProperty: 'pagerank'
})
YIELD nodePropertiesWritten, ranIterations;
