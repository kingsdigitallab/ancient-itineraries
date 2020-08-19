import { UnrealBloomPass } from '//unpkg.com/three/examples/jsm/postprocessing/UnrealBloomPass.js'

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

  this.bloomEffect = false
}

function render(elem, jsonl) {
  const data = getData(jsonl)

  const graph = getGraph(elem, data)
  graph.d3Force('charge').strength(-120)

  const settings = new Settings()
  const gui = getGUI(settings, graph)
}

function getGUI(settings, graph) {
  const gui = new dat.GUI()

  gui
    .add(settings, 'showRootNode')
    .onChange(() => toggleRootNode(graph, settings))
  gui
    .add(settings, 'bloomEffect')
    .onChange(() => toggleBloomEffect(graph, settings))

  return gui
}

function toggleRootNode(graph, settings) {
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

function toggleBloomEffect(graph, settings) {
  if (settings.bloomEffect) {
    const bloomPass = new UnrealBloomPass()
    bloomPass.strength = 3
    bloomPass.radius = 1
    bloomPass.threshold = 0.1

    graph.postProcessingComposer().addPass(bloomPass)
  } else {
    graph.postProcessingComposer().passes.pop()
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
