/**
 * Maltego Graph Export Utilities
 * Handles export of Maltego graphs to PNG, JSON, and CSV formats
 */

interface MaltegoNode {
  id: string;
  label: string;
  type: string;
  properties?: Record<string, any>;
}

interface MaltegoEdge {
  from: string;
  to: string;
  label: string;
  weight?: number;
}

interface MaltegoGraphData {
  nodes: MaltegoNode[];
  edges: MaltegoEdge[];
  entity: string;
  transforms_executed: number;
}

/**
 * Export graph to JSON format
 */
export const exportToJSON = (graphData: MaltegoGraphData, filename?: string): void => {
  const jsonStr = JSON.stringify(graphData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, filename || `maltego-graph-${graphData.entity}.json`);
};

/**
 * Export nodes to CSV format
 */
export const exportNodesToCSV = (nodes: MaltegoNode[], filename?: string): void => {
  // CSV Header
  let csv = 'ID,Label,Type,Properties\n';
  
  // CSV Rows
  nodes.forEach(node => {
    const properties = node.properties 
      ? JSON.stringify(node.properties).replace(/"/g, '""') 
      : '';
    csv += `"${node.id}","${node.label}","${node.type}","${properties}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename || 'maltego-nodes.csv');
};

/**
 * Export edges to CSV format
 */
export const exportEdgesToCSV = (edges: MaltegoEdge[], filename?: string): void => {
  // CSV Header
  let csv = 'From,To,Label,Weight\n';
  
  // CSV Rows
  edges.forEach(edge => {
    csv += `"${edge.from}","${edge.to}","${edge.label}","${edge.weight || 1}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename || 'maltego-edges.csv');
};

/**
 * Export complete graph to CSV (nodes and edges in separate files)
 */
export const exportToCSV = (graphData: MaltegoGraphData, entityName?: string): void => {
  const baseName = entityName || graphData.entity;
  exportNodesToCSV(graphData.nodes, `maltego-nodes-${baseName}.csv`);
  exportEdgesToCSV(graphData.edges, `maltego-edges-${baseName}.csv`);
};

/**
 * Export canvas to PNG
 */
export const exportCanvasToPNG = (canvas: HTMLCanvasElement, filename?: string): void => {
  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, filename || 'maltego-graph.png');
    }
  }, 'image/png', 1.0);
};

/**
 * Batch export multiple graphs
 */
export const batchExport = async (
  graphs: Array<{ data: MaltegoGraphData; canvas?: HTMLCanvasElement }>,
  format: 'json' | 'csv' | 'png',
  onProgress?: (current: number, total: number) => void
): Promise<void> => {
  const total = graphs.length;
  
  for (let i = 0; i < graphs.length; i++) {
    const { data, canvas } = graphs[i];
    const entityName = data.entity.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    try {
      switch (format) {
        case 'json':
          exportToJSON(data, `maltego-${entityName}.json`);
          break;
        case 'csv':
          exportToCSV(data, entityName);
          break;
        case 'png':
          if (canvas) {
            exportCanvasToPNG(canvas, `maltego-${entityName}.png`);
          }
          break;
      }
      
      // Small delay to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (onProgress) {
        onProgress(i + 1, total);
      }
    } catch (error) {
      console.error(`Failed to export graph ${entityName}:`, error);
    }
  }
};

/**
 * Create ZIP archive of multiple exports
 * Note: Requires JSZip library
 */
export const exportToZip = async (
  graphs: MaltegoGraphData[],
  format: 'json' | 'csv',
  zipFilename: string = 'maltego-graphs.zip'
): Promise<void> => {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    graphs.forEach((graph) => {
      const entityName = graph.entity.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      if (format === 'json') {
        const jsonStr = JSON.stringify(graph, null, 2);
        zip.file(`${entityName}.json`, jsonStr);
      } else if (format === 'csv') {
        // Add nodes CSV
        let nodesCsv = 'ID,Label,Type,Properties\n';
        graph.nodes.forEach(node => {
          const properties = node.properties 
            ? JSON.stringify(node.properties).replace(/"/g, '""') 
            : '';
          nodesCsv += `"${node.id}","${node.label}","${node.type}","${properties}"\n`;
        });
        zip.file(`${entityName}-nodes.csv`, nodesCsv);
        
        // Add edges CSV
        let edgesCsv = 'From,To,Label,Weight\n';
        graph.edges.forEach(edge => {
          edgesCsv += `"${edge.from}","${edge.to}","${edge.label}","${edge.weight || 1}"\n`;
        });
        zip.file(`${entityName}-edges.csv`, edgesCsv);
      }
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    downloadBlob(content, zipFilename);
  } catch (error) {
    console.error('Failed to create ZIP archive:', error);
    throw new Error('ZIP export requires jszip package');
  }
};

/**
 * Helper to trigger download of blob
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Export graph data to Gephi-compatible GEXF format
 */
export const exportToGEXF = (graphData: MaltegoGraphData, filename?: string): void => {
  const gexf = `<?xml version="1.0" encoding="UTF-8"?>
<gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">
  <meta>
    <creator>FootprintIQ Maltego</creator>
    <description>OSINT Graph for ${graphData.entity}</description>
  </meta>
  <graph mode="static" defaultedgetype="directed">
    <nodes>
      ${graphData.nodes.map(node => `
      <node id="${node.id}" label="${escapeXml(node.label)}">
        <attvalues>
          <attvalue for="type" value="${escapeXml(node.type)}"/>
        </attvalues>
      </node>`).join('')}
    </nodes>
    <edges>
      ${graphData.edges.map((edge, idx) => `
      <edge id="${idx}" source="${edge.from}" target="${edge.to}" label="${escapeXml(edge.label)}" weight="${edge.weight || 1}"/>`).join('')}
    </edges>
  </graph>
</gexf>`;

  const blob = new Blob([gexf], { type: 'application/xml' });
  downloadBlob(blob, filename || `maltego-graph-${graphData.entity}.gexf`);
};

/**
 * Escape XML special characters
 */
const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
