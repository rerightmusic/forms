import { Block } from './block';
import { RecordInputBlock } from './record/recordInputBlock';

export type SectionInputBlock = {
  tag: 'SectionInputBlock';
  title?: string;
  blocks: Block[];
  visible?: boolean;
  label?: string;
  opts?: {
    divider?: boolean;
  };
};

export const sectionToRecordInputBlock: (s: SectionInputBlock) => RecordInputBlock = (
  b: SectionInputBlock
) => ({
  tag: 'RecordInputBlock',
  blocks: b.blocks,
  visible: b.visible,
  label: b.label,
});
