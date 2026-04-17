import type { Block, BlockType } from '../types/admin';
import { renderBlock } from '../utils/blockRenderer';

function loadSystemBlocks(pageId: string): Block[] {
  try {
    const data = localStorage.getItem('system_page_data');
    if (data) return JSON.parse(data)?.[pageId]?.blocks ?? [];
  } catch { /**/ }
  return [];
}

export default function SystemPageBlocks({ pageId, skipTypes = [] }: { pageId: string; skipTypes?: BlockType[] }) {
  const blocks = loadSystemBlocks(pageId).filter(b => !skipTypes.includes(b.type));
  if (blocks.length === 0) return null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {blocks.map(block => renderBlock(block))}
    </div>
  );
}
