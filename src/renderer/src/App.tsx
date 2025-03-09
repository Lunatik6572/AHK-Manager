import React from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import CssBaseline from '@mui/material/CssBaseline'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Home from './components/Home'
import Scripting from './components/Scripting'

enum PageName
{
    Home = 'Home',
    Scripting = 'Scripting'
}

export default function App(): React.JSX.Element
{
    const drawerWidth = 150

    const linkTexts: Map<string, string> = new Map<string, string>([
        [PageName.Home, '/'],
        [PageName.Scripting, '/scripting']
    ])

    return (
        <HashRouter>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' }
                    }}
                >
                    <List>
                        {Array.from(linkTexts.entries()).map(([text, link]) => (
                            <ListItem key={text} disablePadding>
                                <ListItemButton component={Link} to={link}>
                                    <ListItemText primary={text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 1 }}>
                    <Routes>
                        <Route path={linkTexts.get(PageName.Home)} element={<Home />} />
                        <Route path={linkTexts.get(PageName.Scripting)} element={<Scripting />} />
                    </Routes>
                </Box>
            </Box>

        </HashRouter>
    )
}