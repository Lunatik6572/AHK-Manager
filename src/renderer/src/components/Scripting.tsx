import { useState, JSX } from "react";
import { Container, Typography, List, ListItemButton, ListItemText, Collapse, Button, Box, Divider, TextField, FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { getHotkeys, getHotstrings } from "./IpcCaller"
import { HotkeyI, HotstringI, HotstringOptions, HotkeyModifiers } from "../../../commons/ahk_objects";
import { CheckBox } from "@mui/icons-material";

export default function Scripting(): JSX.Element
{

    enum ExpandGroups {
        HOTKEY,
        HOTSTRING,
        HOTKEY_OPTION,
        HOTSTRING_OPTION
    }

    let hotkeyItems: HotkeyI[] = []
    let hotstringItems: HotstringI[] = []

    const[expanded, setExpanded] = useState<string | null>(null)

    const[hotkeyExpanded, setHotkeyExpanded] = useState<string | null>(null)
    const[hotstringExpanded, setHotstringExpanded] = useState<string | null>(null)
    const[hotkeyOptionExpanded, setHotkeyOptionExpanded] = useState<string | null>(null)
    const[hotstringOptionExpanded, setHotstringOptionExpanded] = useState<string | null>(null)

    const handleToggle = (id: string): void =>
    {
        setExpanded(expanded === id ? null : id);
    };

    const expandToggle = (group: ExpandGroups, id:string): void => 
    {
        switch(group)
        {
            case ExpandGroups.HOTKEY:
                setHotkeyExpanded(hotkeyExpanded === id ? null : id)
                break
            case ExpandGroups.HOTSTRING:
                setHotstringExpanded(hotstringExpanded === id ? null : id)
                break
            case ExpandGroups.HOTKEY_OPTION:
                setHotkeyOptionExpanded(hotkeyOptionExpanded === id ? null : id)
                break
            case ExpandGroups.HOTSTRING_OPTION:
                setHotstringOptionExpanded(hotstringOptionExpanded === id ? null : id)
                break
        }
    }

    const getAllItems = (): void =>
    {
        getHotkeys().then((hotkeys) =>
        {
            hotkeyItems = JSON.parse(hotkeys)
        })

        getHotstrings().then((hotstrings) =>
        {
            hotstringItems = JSON.parse(hotstrings)
        })
    }

    getAllItems()

    const showHotstrings = (): JSX.Element =>
    {   
        return (
            <List>
                {hotstringItems.map((item) => (
                    <Box key={item.keys}>
                        <ListItemButton onClick={() => expandToggle(ExpandGroups.HOTSTRING, item.keys)}>
                            <ListItemText primary={item.keys} />
                            {hotstringExpanded === item.keys ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                        <Collapse in={hotstringExpanded === item.keys} timeout="auto" unmountOnExit>
                            <Box sx={{ pl: 4, pb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {item.action}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.options}
                                </Typography>
                                <Button variant="contained" size="small" sx={{ mt: 1 }}>
                                    Action
                                </Button>
                            </Box>
                        </Collapse>
                    </Box>
                ))}
            </List>
        )
    }

    const showHotkeys = (): JSX.Element =>
    {
        return (
            <List>
                {hotkeyItems.map((item) => (
                    <Box key={item.keys}>
                        <ListItemButton onClick={() => expandToggle(ExpandGroups.HOTKEY, item.keys)}>
                            <ListItemText primary={item.keys} />
                            {hotkeyExpanded === item.keys ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                        <Collapse in={hotkeyExpanded === item.keys} timeout="auto" unmountOnExit>
                            <Box sx={{ pl: 4, pb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {item.action}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.modifiers}
                                </Typography>
                                <Button variant="contained" size="small" sx={{ mt: 1 }}>
                                    Action
                                </Button>
                            </Box>
                        </Collapse>
                    </Box>
                ))}
            </List>
        )
    }

    const hotstringOptionForm = (): JSX.Element =>
    {
        return (
            <FormControl>
                <FormLabel>Options</FormLabel>
                <FormGroup>
                    {Object.entries(HotstringOptions).map(([key, value]) => (
                        <FormControlLabel
                            key={key}
                            control={<Checkbox />}
                            label={`${value.name}: ${value.description}`}
                        />
                    ))}
                </FormGroup>
            </FormControl>
        )
    }

    return (
        <>
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    AHK Items
                </Typography>
                <Divider variant="middle" sx={{ mt: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                        Hotstrings
                    </Typography>
                </Divider>
                {hotstringItems.keys.length > 0 ? showHotstrings() : <Typography variant="body1" color="text.secondary">No hotstrings found</Typography>}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
                    <TextField 
                        id="hotstring-key" 
                        label="Hotstring Keys" 
                        variant="outlined" 
                        size="small"
                        sx={{ width: '40%' }}
                    />
                    <TextField 
                        id="hotstring-action" 
                        label="Hotstring Action" 
                        variant="outlined" 
                        size="small"
                        sx={{ width: '60%' }}
                    />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                    {hotstringOptionForm()}
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                    <Button variant="contained" color="primary">
                        Add New Hotstring
                    </Button>
                </Box>
                <Divider variant="middle" sx={{ mt: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                        Hotkeys
                    </Typography>
                </Divider>
                {hotkeyItems.keys.length > 0 ? showHotkeys() : <Typography variant="body1" color="text.secondary">No hotkeys found</Typography>}
            </Container>
        </>
    )
}