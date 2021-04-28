import { UnrealBloomPass } from '//unpkg.com/three@0.127.0/examples/jsm/postprocessing/UnrealBloomPass.js'

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

  this.showLinkLabels = false
  this.showDirectionalParticles = false
  this.textAsNodes = false
  this.bloomEffect = false
}

function render(elem, jsonl) {
  const data = getData(jsonl)

  const graph = getGraph(data, elem)
  graph.d3Force('charge').strength(-120)

  const settings = new Settings()
  const gui = getGUI(settings, graph)

  addLegend(graph)
}

function getData(jsonl) {
  let nodes = []
  let links = []

  const lines = jsonl.split('\n')
  lines.forEach((element) => {
    if (element) {
      const obj = JSON.parse(element)
      if (obj.type === 'node') {
        nodes.push(obj)
      } else {
        links.push({
          source: obj.start.id,
          target: obj.end.id,
          curvature: 0.25,
          rotation: 0,
          rel: obj
        })
      }
    }
  })

  links = addRotation(links)

  return { nodes: nodes, links: links }
}

function addRotation(linksWithoutRotation) {
  let links = Array.from(linksWithoutRotation)

  links.sort((a, b) => {
    if (a.source === b.source) {
      return parseInt(a.target) - parseInt(b.target)
    }

    return parseInt(a.source) - parseInt(b.source)
  })

  let prevLink = { source: null, target: null }
  let count = 0

  for (var i = 0; i < links.length; i++) {
    let link = links[i]

    if (prevLink.source === link.source && prevLink.target === link.target) {
      count += 1

      link.rotation = Math.PI / count
    } else {
      count = 0
    }

    prevLink = link
  }

  return links
}

function getGraph(data, elem) {
  return ForceGraph3D()(elem)
    .graphData(data)
    .nodeVal((node) => 40 * node.properties.pagerank)
    .nodeLabel((node) => getNodeLabel(node))
    .nodeAutoColorBy((node) => node.labels[0])
    .nodeOpacity(0.75)
    .nodeResolution(16)
    .onNodeClick((node) =>
      node.properties.URI
        ? window.open(node.properties.URI, node.properties.URI)
        : null
    )
    .onNodeHover((node) => (elem.style.cursor = node ? 'pointer' : null))
    .onNodeDragEnd((node) => {
      node.fx = node.x
      node.fy = node.y
      node.fz = node.z
    })
    .linkLabel((link) => getLinkLabel(link))
    .linkAutoColorBy((link) => link.rel.label)
    .linkOpacity(0.5)
    .linkWidth(1)
    .linkResolution(16)
    .linkCurvature('curvature')
    .linkCurveRotation('rotation')
    .onLinkHover((link) => (elem.style.cursor = link ? 'pointer' : null))
}

function getNodeLabel(node) {
  let label = `${node.labels}:`

  if (node.properties.desc) {
    label = `${label} ${node.properties.desc}`
  }

  if (node.properties.URI) {
    label = `${label} [<a href="${node.properties.URI}">${node.properties.URI}</a>]`
  }

  return label
}

function getLinkLabel(link) {
  if (link.rel.label) {
    return link.rel.label.toLowerCase().replace(/_/g, ' ')
  }
}

function getGUI(settings, graph) {
  const gui = new dat.GUI()

  gui
    .add(settings, 'showRootNode')
    .onChange(() => toggleRootNode(graph, settings))
  gui
    .add(settings, 'showLinkLabels')
    .onChange(() => toggleLinkLabels(graph, settings))
  gui
    .add(settings, 'showDirectionalParticles')
    .onChange(() => toggleDirectionalParticles(graph, settings))
  gui
    .add(settings, 'textAsNodes')
    .onChange(() => toggleTextAsNodes(graph, settings))
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

function toggleLinkLabels(graph, settings) {
  if (settings.showLinkLabels) {
    graph
      .linkThreeObjectExtend(true)
      .linkThreeObject((link) => {
        // extend link with text sprite
        const sprite = new SpriteText(getLinkLabel(link))
        sprite.color = link.color
        sprite.textHeight = 4

        return sprite
      })
      .linkPositionUpdate((sprite, { start, end }) => {
        if (sprite !== undefined) {
          const middlePos = Object.assign(
            ...['x', 'y', 'z'].map((c) => ({
              // calc middle point
              [c]: start[c] + (end[c] - start[c]) / 2
            }))
          )

          // position sprite
          Object.assign(sprite.position, middlePos)
        }
      })
  } else {
    graph
      .linkThreeObjectExtend(false)
      .linkThreeObject(null)
      .linkPositionUpdate(null)
  }
}

function toggleDirectionalParticles(graph, settings) {
  if (settings.showDirectionalParticles) {
    graph
      .linkDirectionalParticles(3)
      .linkDirectionalParticleWidth(1.5)
      .linkDirectionalParticleSpeed(0.006)
      .linkDirectionalParticleResolution(16)
  } else {
    graph.linkDirectionalParticles(0)
  }
}

function toggleTextAsNodes(graph, settings) {
  if (settings.textAsNodes) {
    graph.nodeThreeObject((node) => {
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
  } else {
    graph.nodeThreeObject(null)
  }
}

function getNodeText(node) {
  if (node.properties.desc) {
    return node.properties.desc
  }

  return node.labels
}

function toggleBloomEffect(graph, settings) {
  if (settings.bloomEffect) {
    const bloomPass = new UnrealBloomPass()
    bloomPass.strength = 2
    bloomPass.radius = 1
    bloomPass.threshold = 0.1

    graph.postProcessingComposer().addPass(bloomPass)
  } else {
    graph.postProcessingComposer().passes.pop()
  }
}

function addLegend(graph) {
  let hasLegend = false

  graph.onEngineTick(() => {
    if (hasLegend) return

    const data = graph.graphData()

    let nodeColours = {}
    data.nodes.forEach((node) => (nodeColours[node.labels[0]] = node.color))
    nodeColours = sortColoursByLabel(nodeColours)

    let linkColours = {}
    data.links.forEach((link) => (linkColours[getLinkLabel(link)] = link.color))
    linkColours = sortColoursByLabel(linkColours)

    addColourLegend(document.getElementById('nodes'), nodeColours, '&#11044; ')
    addColourLegend(document.getElementById('links'), linkColours, '&#9472; ')

    hasLegend = true
  })
}

function sortColoursByLabel(colours) {
  return Object.fromEntries(
    Object.entries(colours).sort((a, b) => {
      if (a[0] < b[0]) {
        return -1
      }

      if (a[0] > b[0]) {
        return 1
      }

      return 0
    })
  )
}

function addColourLegend(elem, colours, symbol) {
  for (const label in colours) {
    let li = document.createElement('li')
    li.textContent = label

    let span = document.createElement('span')
    span.setAttribute('style', `color: ${colours[label]}; opacity: 0.75;`)
    span.innerHTML = symbol

    li.insertBefore(span, li.firstChild)

    elem.appendChild(li)
  }
}
