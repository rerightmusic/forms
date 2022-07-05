import { Link as LinkMui, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import Link from 'next/link';
import { HTMLAttributeAnchorTarget } from 'react';

const Anchor = ({
  href,
  children,
  sx,
  target,
}: {
  href: string;
  sx?: SxProps<Theme>;
  target?: HTMLAttributeAnchorTarget;
  children: React.ReactNode;
}) => {
  return (
    /* If we use passHref here it gives an error: Prop `href` did not match. */
    // eslint-disable-next-line @next/next/link-passhref
    <Link href={href}>
      <LinkMui
        href={href}
        sx={{
          color: 'inherit',
          textDecoration: 'none',
          cursor: 'pointer',
          display: 'flex',
          ...sx,
        }}
        target={target}
        rel="noreferrer"
      >
        {children}
      </LinkMui>
    </Link>
  );
};

export default Anchor;
