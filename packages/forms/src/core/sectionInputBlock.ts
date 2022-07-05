import { RecordInputBlock } from './record/recordInputBlock';

export type SectionInputBlock = {
  tag: 'SectionInputBlock';
  title: string;
  block: RecordInputBlock;
  opts?: {
    divider?: boolean;
  };
};
