import styled from "styled-components";

const DashboardStyles = styled.div`
  .dashboard-title {
    padding-top: 1rem;
    display: flex;
    justify-content: center;
  }

  .server-card {
    border-radius: 0.75rem;

    .server-img-container {
      position: relative;

      .server-img-blurred {
        padding: 1rem;
        max-height: 120px;
        object-fit: cover;
        filter: blur(8px);
        pointer-events: none;
        user-select: none;
      }

      .server-img-icon {
        border-radius: 50%;

        width: 75px;
        height: 75px;

        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        user-select: none;

        box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 80%),
          0px 6px 10px 0px rgb(0 0 0 / 14%), 0px 1px 18px 0px rgb(0 0 0 / 12%);
      }
    }

    .server-buttons {
      display: flex;
      justify-content: end;
    }
  }
`;

export default DashboardStyles;
