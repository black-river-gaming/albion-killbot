import styled from "styled-components";

const StyledPremium = styled.div`
  .user-subscriptions {
    .user-subscription-list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .info {
        .id-text {
          font-size: 10px;

          color: ${({ theme }) => theme.mutedText};
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
