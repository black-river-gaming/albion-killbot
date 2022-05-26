import { Grid } from "@mui/material";
import Button from "@mui/material/Button";

export default function TypographyTheme() {
  return (
    <Grid
      container
      spacing={5}
      direction={{ xs: "row-reverse", md: "column", lg: "row" }}
    >
      <Grid item xs={12} md={4} lg={8}>
        <Button fullWidth variant="contained">
          Hello World
        </Button>
      </Grid>
      <Grid item xs={8} md={4} lg={2}>
        <Button fullWidth variant="outlined">
          Hello World
        </Button>
      </Grid>
      <Grid item xs={4} md={4} lg={2}>
        <Button fullWidth variant="text">
          Hello World
        </Button>
      </Grid>
    </Grid>
  );
}
