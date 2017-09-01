import * as d3 from 'd3';

export default {

  update(container, data) {

    if (!container) return

    const stratify = d3.stratify()
      .id(function (d) { return d.name; })
      .parentId(function (d) { return d.parent; });

    const root = stratify(data);

    const height = root.height * 300 + 40;
    const width = 1200;

    d3.tree().size([width, height])(root);

    d3.select(container).select('svg').remove();
    const svg = d3.select(container).append('svg');

    const g = svg
      .style('height', height)
      .style('width', width)
      .append("g").attr('transform', 'translate(0,40)');

    g.selectAll('.link')
      .data(root.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', diagonal);

    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr("transform", d => `translate(${d.x}, ${d.parent ? d.y : d.y - 10})`);

    node.filter(d => d.data.type !== 'alias')
      .append('text')
      .text(d => d.id);

    node.filter(d => d.data.type === 'alias')
      .append("foreignObject")
      .attr('width', '200')
      .attr('height', '20')
      .html(d => `<div>HI!</div>`)
    // .html(d => `<input type="text" value="${d.id}" name="alias">`)
    // .on('input', d => foobar(d3.event, d));
  }
}

function diagonal({ source, target }) {
  return `
  M ${target.x},${target.y}
  C ${target.x},${target.y - 100} ${source.x},${source.y + 200} ${source.x},${source.y}
  `
}
// var t = d3.transition().duration(750);
// node.transition(t).attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
// link.transition(t).attr("d", diagonal);
