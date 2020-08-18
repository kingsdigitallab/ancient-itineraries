const elem = document.getElementById('viz')

fetch('../data/processed/dancingfaun.jsonl')
  .then((response) => response.text())
  .then((jsonl) => view(jsonl))

function view(jsonl) {
  let nodes = {}
  let relationships = []

  const lines = jsonl.split('\n')
  lines.forEach((element) => {
    if (element) {
      const obj = JSON.parse(element)
      if (obj.type === 'node') {
        nodes[obj.id] = obj
      } else {
        relationships.push({
          source: obj.start.id,
          target: obj.end.id,
          rel: obj
        })
      }
    }
  })

  const data = { nodes: Object.values(nodes), links: relationships }

  const Graph = ForceGraph3D()(elem)
    .graphData(data)
    .nodeAutoColorBy('labels')
    .nodeVal((node) => `${25 * node.properties.pagerank}`)
    .nodeLabel((node) => `${getNodeLabel(node)}`)
    .nodeThreeObject((node) => {
      // use a sphere as a drag handle
      const obj = new THREE.Mesh(
        new THREE.SphereGeometry(10),
        new THREE.MeshBasicMaterial({
          depthWrite: false,
          transparent: true,
          opacity: 0
        })
      )

      // add text sprite as child
      const sprite = new SpriteText(getNodeText(node))
      sprite.color = node.color
      sprite.textHeight = 40 * node.properties.pagerank
      obj.add(sprite)

      return obj
    })
    .linkAutoColorBy((link) => `${link.rel.label}`)
    .linkOpacity(0.75)
    //.linkThreeObject((link) => {
    //// extend link with text sprite
    //const sprite = new SpriteText(`${link.rel.label}`)
    //sprite.color = link.color
    //sprite.textHeight = 4

    //return sprite
    //})
    //.linkPositionUpdate((sprite, { start, end }) => {
    //const middlePos = Object.assign(
    //...['x', 'y', 'z'].map((c) => ({
    //// calc middle point
    //[c]: start[c] + (end[c] - start[c]) / 2
    //}))
    //)

    //// position sprite
    //Object.assign(sprite.position, middlePos)
    //})
    .onNodeHover((node) => (elem.style.cursor = node ? 'pointer' : null))

  // spread nodes a little wider
  Graph.d3Force('charge').strength(-120)
}

function getNodeLabel(node) {
  let label = node.labels

  if (node.properties.desc) {
    return `${node.properties.desc} [${label}]`
  }

  return `${node.properties.URI} [${label}]`
}

function getNodeText(node) {
  if (node.properties.desc) {
    return node.properties.desc
  }

  return node.labels
}
