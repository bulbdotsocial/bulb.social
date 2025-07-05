import { useTheme } from '@mui/material/styles';

export const useLogo = () => {
  const theme = useTheme();
  
  // Return the appropriate logo based on theme mode
  const logoSrc = theme.palette.mode === 'dark' ? '/logo_light.png' : '/logo_dark.png';
  
  return {
    logoSrc,
    appLogoSrc: '/logo_app.png',
  };
};
