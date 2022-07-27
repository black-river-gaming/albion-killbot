import styled from "styled-components";

const PaperStyles = styled.div`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};

  background-image: linear-gradient(
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.05)
  );

  box-shadow: rgb(0 0 0 / 20%) 0px 2px 1px -1px,
    rgb(0 0 0 / 14%) 0px 1px 1px 0px, rgb(0 0 0 / 12%) 0px 1px 3px 0px;

  &.elevation-0 {
    box-shadow: none;
    background-image: linear-gradient(
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0)
    );
  }

  &.elevation-2 {
    box-shadow: rgb(0 0 0 / 20%) 0px 3px 3px -2px,
      rgb(0 0 0 / 14%) 0px 3px 4px 0px, rgb(0 0 0 / 12%) 0px 1px 8px 0px;
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.08)
    );
  }

  &.elevation-4 {
    box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%),
      0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.09),
      rgba(255, 255, 255, 0.09)
    );
  }

  &.elevation-6 {
    box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%),
      0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.11),
      rgba(255, 255, 255, 0.11)
    );
  }

  &.elevation-8 {
    box-shadow: 0px 5px 5px -3px rgb(0 0 0 / 20%),
      0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%);
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.12)
    );
  }

  &.elevation-12 {
    box-shadow: 0px 7px 8px -4px rgb(0 0 0 / 20%),
      0px 12px 17px 2px rgb(0 0 0 / 14%), 0px 5px 22px 4px rgb(0 0 0 / 12%);
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.14),
      rgba(255, 255, 255, 0.14)
    );
  }

  &.elevation-16 {
    box-shadow: 0px 8px 10px -5px rgb(0 0 0 / 20%),
      0px 16px 24px 2px rgb(0 0 0 / 14%), 0px 6px 30px 5px rgb(0 0 0 / 12%);
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.15),
      rgba(255, 255, 255, 0.15)
    );
  }

  &.elevation-24 {
    box-shadow: 0px 11px 15px -7px rgb(0 0 0 / 20%),
      0px 24px 38px 3px rgb(0 0 0 / 14%), 0px 9px 46px 8px rgb(0 0 0 / 12%);
    background-image: linear-gradient(
      rgba(255, 255, 255, 0.16),
      rgba(255, 255, 255, 0.16)
    );
  }
`;

export default PaperStyles;
