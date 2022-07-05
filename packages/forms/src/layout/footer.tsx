import React from 'react';

export type FooterProps = {
  footer: React.ReactElement | null;
  opts?: { borderColor: string };
};

export const FooterContext = React.createContext(null as ((props: FooterProps) => void) | null);

export const useFooter = () => {
  const setFooter = React.useContext(FooterContext)!;
  return setFooter;
};
