/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Box } from '@mui/material';
import { assertNever } from '../data';
import { CenterPage } from '../layout/center';

export const Loader = ({ color, loader }: { color: string; loader: 'pacman' | 'pulse-out' }) => {
  let loaderEl;
  switch (loader) {
    case 'pacman':
      loaderEl = <Pacman color={color} />;
      break;

    case 'pulse-out':
      loaderEl = <PulseOut color={color} />;
      break;

    default:
      assertNever(loader);
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {loaderEl}
    </Box>
  );
};

export const PageLoader = ({
  color,
  loader,
}: {
  color: string;
  loader: 'pacman' | 'pulse-out';
}) => {
  return <CenterPage>{<Loader color={color} loader={loader} />}</CenterPage>;
};

export const Pacman = ({ color }: { color: string }) => (
  <div className="loader">
    <div className="pacman">
      <div
        css={css`
          border-top-color: ${color} !important;
          border-left-color: ${color} !important;
          border-bottom-color: ${color} !important;
        `}
      ></div>
      <div
        css={css`
          border-top-color: ${color} !important;
          border-left-color: ${color} !important;
          border-bottom-color: ${color} !important;
        `}
      ></div>
      <div
        css={css`
          background-color: ${color} !important;
        `}
      ></div>
      <div
        css={css`
          background-color: ${color} !important;
        `}
      ></div>
      <div
        css={css`
          background-color: ${color} !important;
        `}
      ></div>
    </div>
  </div>
);

export const PulseOut = ({ color }: { color: string }) => (
  <div className="loader">
    <div
      className="line-scale-pulse-out"
      css={css`
        > div {
          background-color: ${color}!important;
        }
      `}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
);
