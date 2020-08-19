window.onload = function () {
  const elem = document.getElementById('graph')

  fetch('../data/processed/dancingfaun.jsonl')
    .then((response) => response.text())
    .then((jsonl) => render(elem, jsonl))
}

const Settings = function () {
  this.showRootNode = true
  this.node = null
  this.links = []
}

function render(elem, jsonl) {
  const data = getData(jsonl)

  const graph = getGraph(elem, data)
  graph.d3Force('charge').strength(-120)

  const settings = new Settings()
  const gui = getGUI(settings, graph, jsonl)
}

function getGUI(settings, graph, jsonl) {
  const gui = new dat.GUI()

  gui
    .add(settings, 'showRootNode')
    .onChange(() => updateGraph(graph, settings, jsonl))

  return gui
}

function updateGraph(graph, settings, jsonl) {
  let { nodes, links } = graph.graphData()

  if (settings.showRootNode) {
    nodes.push(settings.node)
    links = links.concat(settings.links)

    graph.graphData({ nodes, links })
  } else {
    const node = nodes.find((n) => n.id === '0')
    settings.node = node
    nodes = nodes.filter((n) => n.id !== '0')

    settings.links = links.filter((l) => l.source === node || l.target === node)
    links = links.filter((l) => l.source !== node && l.target !== node)

    graph.graphData({ nodes, links })
  }
}

function getData(jsonl) {
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

  return { nodes: Object.values(nodes), links: relationships }
}

function getGraph(elem, data) {
  return (
    ForceGraph3D()(elem)
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
  )
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
