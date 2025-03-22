import { useState, JSX, FormEvent, useEffect } from "react"
import { Container, Typography, List, ListItemButton, ListItemText, Collapse, Button, Box, Divider, TextField, FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import { HotkeyI, HotstringI, HotstringOptions, HotkeyModifiers, HotstringOptionCodes } from "../../../commons/ahk_objects"
import * as IpcCaller from "./IpcCaller"
import "./HotstringEditor"
import HotstringEditor from "./HotstringEditor"

enum ExpandGroups
{
    HOTKEY,
    HOTSTRING,
    HOTKEY_OPTION,
    HOTSTRING_OPTION
}

export default function Scripting(): JSX.Element
{
    const [hotkeyItems, setHotkeyItems] = useState<HotkeyI[]>([]);
    const [hotstringItems, setHotstringItems] = useState<HotstringI[]>([]);

    const [hotkeyExpanded, setHotkeyExpanded] = useState<string | null>(null)
    const [hotstringExpanded, setHotstringExpanded] = useState<string | null>(null)
    const [hotkeyOptionExpanded, setHotkeyOptionExpanded] = useState<string | null>(null)
    const [hotstringOptionExpanded, setHotstringOptionExpanded] = useState<string | null>(null)

    const [hotstringKey, setHotstringKey] = useState<string>('');
    const [hotstringAction, setHotstringAction] = useState<string>('');
    const [hotstringOpts, setHotstringOpts] = useState<Record<string, boolean>>({});

    // Run once on component mount
    useEffect(() =>
    {
        getHotkeys()
        getHotstrings()
    }, [])

    const expandToggle = (group: ExpandGroups, id: string): void => 
    {
        switch (group)
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

    const getHotkeys = async (): Promise<void> =>
    {
        try
        {
            console.log('Getting hotkeys')
            const hotkeys = await IpcCaller.getHotkeys()
            if (hotkeys.success && hotkeys.message !== '')
            {
                setHotkeyItems(JSON.parse(hotkeys.message))
            }
        } catch (error)
        {
            console.error('Error getting hotkeys:', error)
        }
    }

    const getHotstrings = async (): Promise<void> =>
    {
        try
        {
            console.log('Getting hotstrings')
            const hotstrings = await IpcCaller.getHotstrings()
            if (hotstrings.success && hotstrings.message !== '')
            {
                setHotstringItems(JSON.parse(hotstrings.message))
            }
        } catch (error)
        {
            console.error('Error getting hotstrings:', error)
        }
    }

    const handleHotstringSubmit = (e: FormEvent): void =>
    {
        e.preventDefault()

        // Collect selected options
        const selectedOptions = Object.entries(hotstringOpts)
            .filter(([_, selected]) => selected)
            .map(([key, _]) => key as HotstringOptionCodes)

        // Create new hotstring object
        const newHotstring: HotstringI = {
            keys: hotstringKey,
            action: hotstringAction,
            options: selectedOptions
        }

        console.log('New hotstring to add:', newHotstring)
        IpcCaller.addHotstring(newHotstring)
            .then((_) => getHotstrings())
            .catch((err) => console.error(err))


        // Reset form
        setHotstringKey('')
        setHotstringAction('')
        setHotstringOpts({})
    }

    const showHotstrings = (): JSX.Element =>
    {
        return (
            <>
                {hotstringItems.map((item) => (
                    <Box key={item.keys}>
                        <ListItemButton onClick={() => expandToggle(ExpandGroups.HOTSTRING, item.keys)}>
                            <ListItemText primary={`${item.keys}  ->  ${item.action}`} />
                            {hotstringExpanded === item.keys ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                        <Collapse in={hotstringExpanded === item.keys} timeout="auto" unmountOnExit>
                            <Box sx={{ pl: 4, pb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Keys: {item.keys}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Action: {item.action}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Options: {item.options && item.options.length > 0
                                        ? item.options.join(', ')
                                        : 'None'}
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    color="error"
                                    size="small" 
                                    sx={{ mt: 1 }}
                                    onClick={() => {
                                        IpcCaller.deleteHotstring(item.keys)
                                            .then(() => getHotstrings())
                                            .catch((err) => console.error('Error deleting hotstring:', err));
                                    }}
                                >
                                    Delete
                                </Button>
                            </Box>
                        </Collapse>
                    </Box>
                ))}
            </>
        )
    }

    const showHotkeys = (): JSX.Element =>
    {
        return (
            <>
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
            </>
        )
    }

    const newHotstringForm = (): JSX.Element =>
    {
        return (
            <>
                <FormControl component="form" onSubmit={handleHotstringSubmit}>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2, mb: 2 }}>
                        <TextField
                            id="hotstring-key"
                            label="Hotstring Keys"
                            variant="outlined"
                            size="small"
                            sx={{ width: '40%' }}
                            placeholder="e.g. btw"
                            value={hotstringKey}
                            onChange={(e) => setHotstringKey(e.target.value)}
                            required
                        />
                        <TextField
                            id="hotstring-action"
                            label="Hotstring Action"
                            variant="outlined"
                            size="small"
                            sx={{ width: '60%' }}
                            placeholder="e.g. by the way"
                            value={hotstringAction}
                            onChange={(e) => setHotstringAction(e.target.value)}
                            required
                        />
                    </Box>
                    <FormLabel>Options</FormLabel>
                    <FormGroup>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%', gap: 1 }}>
                            {Object.entries(HotstringOptions).map(([key, value]) => (
                                <FormControlLabel
                                    key={key}
                                    control={<Checkbox
                                        checked={!!hotstringOpts[value.code]}
                                        onChange={(e) => setHotstringOpts(prev => ({ ...prev, [value.code]: e.target.checked }))}
                                    />}
                                    label={`${value.name}: ${value.description}`}
                                    sx={{ margin: 0 }}
                                />
                            ))}
                        </Box>
                    </FormGroup>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                        <Button variant="contained" color="primary" type="submit">
                            Add New Hotstring
                        </Button>
                    </Box>
                </FormControl>
            </>
        )
    }

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    AHK Items
                </Typography>
                <Divider variant="middle" sx={{ mt: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                        Hotstrings
                    </Typography>
                </Divider>
                <List>
                    {hotstringItems.length > 0 && showHotstrings()}
                    <Box>
                        <ListItemButton onClick={() => expandToggle(ExpandGroups.HOTSTRING_OPTION, 'HOTSTRING_OPTION')}>
                            <ListItemText primary='Add a new hotstring' />
                            {hotstringExpanded === 'HOTSTRING_OPTION' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                        <Collapse in={hotstringOptionExpanded === 'HOTSTRING_OPTION'} timeout="auto" unmountOnExit>
                            {newHotstringForm()}
                        </Collapse>
                    </Box>
                </List>
                <Divider variant="middle" sx={{ mt: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                        Hotkeys
                    </Typography>
                </Divider>
                <List>
                    {hotkeyItems.length > 0 && showHotkeys()}
                    <Box>
                        <ListItemButton onClick={() => expandToggle(ExpandGroups.HOTKEY_OPTION, 'HOTKEY_OPTION')}>
                            <ListItemText primary='Add a new hotkey' />
                            {hotkeyExpanded === 'HOTKEY_OPTION' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </ListItemButton>
                        <Collapse in={hotkeyOptionExpanded === 'HOTKEY_OPTION'} timeout="auto" unmountOnExit>
                            <HotstringEditor />
                        </Collapse>
                    </Box>
                </List>
            </Container>
        </>
    )
}