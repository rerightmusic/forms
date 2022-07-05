export type OutputBlock = DisplayText | Break | MultilineText | Heading2;

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

export const _break = () => {
  return {
    tag: 'Break',
  } as Break;
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
