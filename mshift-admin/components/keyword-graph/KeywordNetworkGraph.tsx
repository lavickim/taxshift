'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// 타입 정의
interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  category: string;
  frequency: number;
  confidence: number;
  size: number;
  color: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  strength: number;
  confidence: number;
  type: string;
  thickness: number;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  config?: {
    width: number;
    height: number;
    forceStrength: number;
    linkDistance: number;
    centerForce: number;
  };
}

interface KeywordNetworkGraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  className?: string;
  width?: number;
  height?: number;
}

const KeywordNetworkGraph: React.FC<KeywordNetworkGraphProps> = ({
  data,
  onNodeClick,
  onNodeHover,
  className = '',
  width = 1200,
  height = 800
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || !data.nodes.length) return;

    // SVG 초기화
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // 설정값
    const config = data.config || {
      width,
      height,
      forceStrength: -300,
      linkDistance: 100,
      centerForce: 0.1
    };

    // 컨테이너 그룹 생성
    const container = svg
      .attr('width', config.width)
      .attr('height', config.height)
      .append('g');

    // 줌 기능 추가
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);

    // 링크 그룹
    const linkGroup = container.append('g').attr('class', 'links');
    
    // 노드 그룹
    const nodeGroup = container.append('g').attr('class', 'nodes');

    // 라벨 그룹
    const labelGroup = container.append('g').attr('class', 'labels');

    // Force 시뮬레이션 설정
    const simulation = d3.forceSimulation<GraphNode>(data.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(data.links)
        .id(d => d.id)
        .distance(config.linkDistance)
        .strength(0.1))
      .force('charge', d3.forceManyBody().strength(config.forceStrength))
      .force('center', d3.forceCenter(config.width / 2, config.height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as GraphNode).size + 5));

    // 링크 렌더링
    const links = linkGroup
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', 'graph-link')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', d => Math.max(1, d.thickness));

    // 노드 렌더링
    const nodes = nodeGroup
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('class', 'graph-node')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // 라벨 렌더링
    const labels = labelGroup
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .attr('class', 'graph-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', d => Math.max(8, d.size / 2))
      .attr('font-family', 'Arial, sans-serif')
      .attr('fill', '#333')
      .attr('pointer-events', 'none')
      .text(d => d.id)
      .style('user-select', 'none');

    // 이벤트 핸들러
    nodes
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
        onNodeClick?.(d);
        
        // 선택된 노드 하이라이트
        nodes
          .attr('stroke', node => node === d ? '#ff6b6b' : '#fff')
          .attr('stroke-width', node => node === d ? 3 : 1.5);
        
        // 연결된 링크 하이라이트
        links
          .attr('stroke', link => 
            (link.source as GraphNode).id === d.id || (link.target as GraphNode).id === d.id 
              ? '#ff6b6b' : '#999')
          .attr('stroke-opacity', link => 
            (link.source as GraphNode).id === d.id || (link.target as GraphNode).id === d.id 
              ? 0.8 : 0.3);
      })
      .on('mouseover', (event, d) => {
        setHoveredNode(d);
        onNodeHover?.(d);
        
        // 호버 효과
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', d.size * 1.2);
        
        // 툴팁 표시를 위한 커스텀 이벤트
        const tooltip = d3.select('body').selectAll('.graph-tooltip').data([d]);
        
        tooltip.enter()
          .append('div')
          .attr('class', 'graph-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.8)')
          .style('color', 'white')
          .style('padding', '8px')
          .style('border-radius', '4px')
          .style('font-size', '12px')
          .style('pointer-events', 'none')
          .style('z-index', '1000');
        
        d3.select('.graph-tooltip')
          .html(`
            <strong>${d.id}</strong><br/>
            카테고리: ${d.category}<br/>
            빈도: ${d.frequency}<br/>
            신뢰도: ${(d.confidence * 100).toFixed(1)}%
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', (event, d) => {
        setHoveredNode(null);
        onNodeHover?.(null);
        
        // 호버 효과 제거
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('r', d.size);
        
        // 툴팁 제거
        d3.select('.graph-tooltip').remove();
      });

    // 시뮬레이션 틱 이벤트
    simulation.on('tick', () => {
      links
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      nodes
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });

    // 드래그 이벤트 핸들러
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // 배경 클릭 시 선택 해제
    svg.on('click', () => {
      setSelectedNode(null);
      nodes
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);
      links
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.3);
    });

    // 정리 함수
    return () => {
      d3.select('.graph-tooltip').remove();
      simulation.stop();
    };

  }, [data, width, height, onNodeClick, onNodeHover]);

  return (
    <div className={`keyword-network-graph ${className}`}>
      <svg 
        ref={svgRef}
        width={width}
        height={height}
        style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}
      />
      
      {/* 범례 */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>제조업</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
          <span>IT</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>서비스업</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>의료</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <span>금융</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          <span>기타</span>
        </div>
      </div>

      {/* 선택된 노드 정보 */}
      {selectedNode && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg">{selectedNode.id}</h3>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p><strong>카테고리:</strong> {selectedNode.category}</p>
            <p><strong>빈도:</strong> {selectedNode.frequency}</p>
            <p><strong>신뢰도:</strong> {(selectedNode.confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordNetworkGraph;