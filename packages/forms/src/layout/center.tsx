/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

export const CenterPage = (
  props: {
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>
) => {
  const { children, ...other } = props;
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
      `}
      {...other}
    >
      {props.children}
    </div>
  );
};
