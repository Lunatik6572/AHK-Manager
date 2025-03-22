import { FormEvent, useState } from 'react'
import Editor from '@monaco-editor/react'
import { AHK_LANGUAGE_ID } from '../../../commons/common'
import { Box, Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, TextField } from '@mui/material'
import { Hotkey, HotkeyModifierCodes, HotkeyModifiers } from '../../../commons/ahk_objects'

export default function HotstringEditor(): JSX.Element 
{

    const topComment: string = ['; <- This character is for comments. Anything to the right is ignored by AHK',
        '; Add some code below for your hotstring! Here\'s an example:',
        '; Send("^s") ; This will send Ctrl+S',
        '; Send("{Enter}") ; This will send Enter',
        '; MsgBox("Hello, world!") ; This will show a message box',
        '; Run "notepad.exe" ; This will run Notepad',
        '',
        '',
    ].join('\n')

    const [code, setCode] = useState(topComment)

    const [hotkeyOpts, setHotkeyOpts] = useState<Record<string, string>>({});
    const [hotkeyKey, setHotkeyKey] = useState('')

    const handleHotkeySubmit = (e: FormEvent): void =>
    {
        e.preventDefault()

        const strippedCode = code.replace(/;.*(\n|$)/g, '\n').trim()

        const hotkey = new Hotkey(hotkeyKey, strippedCode)

        Object.values(hotkeyOpts).map((modifier) => {
            if (modifier !== '')
            {
                hotkey.addModifier(modifier as HotkeyModifierCodes)
            }
        })

        console.log('New hotkey to add:', hotkey)

        // TODO: Send IPC message to main process to add hotkey
    }


    return (
        <>
            <FormControl component="form" onSubmit={handleHotkeySubmit}>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2, mb: 2 }}>
                    <TextField
                        id="hotkey-key"
                        label="Hotkey Key"
                        variant="outlined"
                        size="small"
                        sx={{ width: '50%' }}
                        placeholder="Must be one key like: s, F11, -, 5, {Insert}, {Tab}"
                        value={hotkeyKey}
                        onChange={(e) => setHotkeyKey(e.target.value)}
                        required
                    />
                    <Button variant="contained" color="primary" type="submit">
                        Add New Hotkey
                    </Button>
                </Box>
                <FormLabel>Options</FormLabel>
                <FormGroup>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '100%', gap: 1 }}>
                        {Object.entries(HotkeyModifiers).map(([key, value]) => (
                            <FormControlLabel
                                key={key}
                                control={<Checkbox
                                    checked={hotkeyOpts[value.group] === value.code}
                                    onChange={(e) => setHotkeyOpts(prev => ({ ...prev, [value.group]: e.target.checked ? value.code : '' }))}
                                />}
                                label={`${value.name}: ${value.description}`}
                                sx={{ margin: 0 }}
                            />
                        ))}
                    </Box>
                </FormGroup>
                <FormLabel>Code</FormLabel>
                <Box sx={{ border: '1px solid #ccc', borderRadius: '4px' }}>
                    <Editor
                        height="300px"
                        defaultLanguage={AHK_LANGUAGE_ID}
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        theme="vs-light"
                        options={{
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            wordWrap: 'on',
                            automaticLayout: true,
                        }}
                    />
                </Box>
            </FormControl>
        </>
    )
}