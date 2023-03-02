export type OutputBlock = LabelledText | DisplayText | Break | MultilineText | Heading2 | Button;

export type LabelledText = {
  tag: 'LabelledText';
  label: string;
  text: string;
};

export type DisplayText = {
  tag: 'DisplayText';
  text: string;
};

export type Heading2 = {
  tag: 'Heading2';
  text: string;
};

export type MultilineText = {
  tag: 'MultilineText';
  lines: string[];
};

export type Break = {
  tag: 'Break';
};

export type Value = {
  tag: 'Value';
};

export type Button = {
  tag: 'Button';
  label: string;
  onClick: () => void;
  visible?: boolean;
};

export const _break = () => {
  return {
    tag: 'Break',
  } as Break;
};

export const labelledText = (label: string, text: string) => {
  return {
    tag: 'LabelledText',
    label,
    text,
  } as LabelledText;
};

export const display = (text: string) => {
  return {
    tag: 'DisplayText',
    text,
  } as DisplayText;
};

export const heading2 = (text: string) => {
  return {
    tag: 'Heading2',
    text,
  } as Heading2;
};

export const multiline = (lines: string[]) => {
  return {
    tag: 'MultilineText',
    lines,
  } as MultilineText;
};

export const button = (label: string, onClick: () => void, opts?: { visible?: boolean }) => {
  return {
    tag: 'Button',
    label,
    onClick,
    visible: opts?.visible,
  } as Button;
};
