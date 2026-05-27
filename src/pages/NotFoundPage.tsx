import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

export const NotFoundPage = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={2} alignItems="flex-start">
            <Typography variant="overline" color="primary.main">
              Page not found
            </Typography>
            <Typography variant="h2">404</Typography>
            <Typography color="text.secondary">
              The page you are looking for does not exist or has moved.
            </Typography>
            <Button component={RouterLink} to="/" variant="contained">
              Return home
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};
