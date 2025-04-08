import React from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import DiscordIcon from "@mui/icons-material/Chat";

const GameFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 2),
  marginTop: "auto",
  backgroundColor: "#252a34",
  color: "#fff",
  borderTop: "1px solid #333",
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  color: "#08d9d6",
  margin: theme.spacing(0, 0.5),
  "&:hover": {
    backgroundColor: "rgba(8, 217, 214, 0.1)",
    color: "#fff",
  },
}));

const Footer: React.FC = () => {
  return (
    <GameFooter component="footer">
      <Container maxWidth="lg">
        <Grid
          container
          spacing={3}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid
            item
            xs={12}
            md={4}
            sx={{ textAlign: { xs: "center", md: "left" } }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", md: "flex-start" },
              }}
            >
              <SportsEsportsIcon
                sx={{ fontSize: 24, color: "#08d9d6", mr: 1 }}
              />
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                GameStore
              </Typography>
            </Box>
            <Typography variant="body2" color="#eaeaea" sx={{ mt: 1 }}>
              Tu destino para los mejores juegos digitales
            </Typography>
          </Grid>

          <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
            <Box sx={{ mt: { xs: 2, md: 0 } }}>
              <SocialButton aria-label="facebook">
                <FacebookIcon />
              </SocialButton>
              <SocialButton aria-label="twitter">
                <TwitterIcon />
              </SocialButton>
              <SocialButton aria-label="instagram">
                <InstagramIcon />
              </SocialButton>
              <SocialButton aria-label="youtube">
                <YouTubeIcon />
              </SocialButton>
              <SocialButton aria-label="discord">
                <DiscordIcon />
              </SocialButton>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
            sx={{ textAlign: { xs: "center", md: "right" } }}
          >
            <Typography variant="body2" color="#eaeaea">
              {"© "}
              {new Date().getFullYear()}{" "}
              <Link
                sx={{
                  color: "#08d9d6",
                  textDecoration: "none",
                  "&:hover": { color: "#fff" },
                }}
                href="#"
              >
                GameStore
              </Link>
              {" | Todos los derechos reservados"}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </GameFooter>
  );
};

export default Footer;
