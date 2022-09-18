import { createTheme } from '@mui/material/styles'

export const customTheme = createTheme({
    palette: {
        primary: {
            light: '#eee',
            main: '#eee',
            dark: '#222',
            contrastText: '#fff',
        },
        secondary: {
            light: '#666',
            main: '#666',
            dark: '#808080',
            contrastText: '#000',
        },
    },
    components: {
        MuiButtonBase: {
            defaultProps: {
                disableTouchRipple: true,
            },
        },
    },
})
