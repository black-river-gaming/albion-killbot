import styled from "styled-components";

const StyledPremium = styled.div`
  .user-subscriptions {
    .user-subscription-list-item {
      :not(:first-child) {
        padding-top: 0.5rem;
        border-top: 1px solid ${({ theme }) => theme.background}77;
      }

      .info {
        .id-text {
          font-size: 10px;
          line-height: 10px;

          color: ${({ theme }) => theme.mutedText};

          .cancelled-text {
            font-size: 12px;
            padding-left: 0.25rem;
            font-weight: 500;
            color: ${({ theme }) => theme.danger};
          }
        }

        .active {
          display: flex;
          align-items: center;

          .price {
            padding-left: 0.25rem;
            font-weight: 500;
          }
        }
      }

      .actions {
        display: flex;

        a:not(:first-child),
        .btn:not(:first-child) {
          margin-left: 0.5rem;
        }
      }
    }
  }
`;

export default StyledPremium;
