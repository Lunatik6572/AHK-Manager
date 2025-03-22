enum HotstringOptionCodes 
{
    IMMEDIATE = '*',
    IN_WORD = '?',
    NO_BACKSPACE = 'B0',
    CASE_SENSITIVE = 'C',
    NO_END_CHAR = 'O',
    RAW = 'R',
    NO_SUSPEND = 'S'
}

enum HotkeyModifierCodes 
{
    WIN = '#',
    LWIN = '<#',
    RWIN = '>#',
    ALT = '!',
    LALT = '<!',
    RALT = '>!',
    CTRL = '^',
    LCTRL = '<^',
    RCTRL = '>^',
    SHIFT = '+',
    LSHIFT = '<+',
    RSHIFT = '>+',
    WILDCARD = '*',
    NO_BLOCK = '~',
    USE_HOOK = '$',
    UP = 'UP'
}

const HotstringOptions = 
[
    {
        code: HotstringOptionCodes.IMMEDIATE,
        name: 'Immediate',
        description: 'Fire the hotstring immediately after typing the last character'
    },
    {
        code: HotstringOptionCodes.IN_WORD,
        name: 'In Word',
        description: 'Fire the hotstring even if it is in the middle of a word'
    },
    {
        code: HotstringOptionCodes.NO_BACKSPACE,
        name: 'No Backspace',
        description: 'Don\'t erase the characters when the hotstring is fired'
    },
    {
        code: HotstringOptionCodes.CASE_SENSITIVE,
        name: 'Case Sensitive',
        description: 'Only run when the case matches exactly'
    },
    {
        code: HotstringOptionCodes.NO_END_CHAR,
        name: 'No End Char',
        description: 'Don\'t keep the end character when the hotstring is fired'
    },
    {
        code: HotstringOptionCodes.RAW,
        name: 'Raw',
        description: 'Don\'t interpret the hotstring'
    },
    {
        code: HotstringOptionCodes.NO_SUSPEND,
        name: 'No Suspend',
        description: 'Allow this hotstring to run even if the script is suspended'
    }
]

const HotkeyModifiers =
    [
        {
            code: HotkeyModifierCodes.WIN,
            name: 'Win',
            description: 'Windows key',
            group: HotkeyModifierCodes.WIN,
        },
        {
            code: HotkeyModifierCodes.LWIN,
            name: 'Left Win',
            description: 'Left Windows key',
            group: HotkeyModifierCodes.WIN,
        },
        {
            code: HotkeyModifierCodes.RWIN,
            name: 'Right Win',
            description: 'Right Windows key',
            group: HotkeyModifierCodes.WIN,
        },
        {
            code: HotkeyModifierCodes.ALT,
            name: 'Alt',
            description: 'Alt key',
            group: HotkeyModifierCodes.ALT,
        },
        {
            code: HotkeyModifierCodes.LALT,
            name: 'Left Alt',
            description: 'Left Alt key',
            group: HotkeyModifierCodes.ALT,
        },
        {
            code: HotkeyModifierCodes.RALT,
            name: 'Right Alt',
            description: 'Right Alt key',
            group: HotkeyModifierCodes.ALT,
        },
        {
            code: HotkeyModifierCodes.CTRL,
            name: 'Ctrl',
            description: 'Ctrl key',
            group: HotkeyModifierCodes.CTRL,
        },
        {
            code: HotkeyModifierCodes.LCTRL,
            name: 'Left Ctrl',
            description: 'Left Ctrl key',
            group: HotkeyModifierCodes.CTRL,
        },
        {
            code: HotkeyModifierCodes.RCTRL,
            name: 'Right Ctrl',
            description: 'Right Ctrl key',
            group: HotkeyModifierCodes.CTRL,
        },
        {
            code: HotkeyModifierCodes.SHIFT,
            name: 'Shift',
            description: 'Shift key',
            group: HotkeyModifierCodes.SHIFT,
        },
        {
            code: HotkeyModifierCodes.LSHIFT,
            name: 'Left Shift',
            description: 'Left Shift key',
            group: HotkeyModifierCodes.SHIFT,
        },
        {
            code: HotkeyModifierCodes.RSHIFT,
            name: 'Right Shift',
            description: 'Right Shift key',
            group: HotkeyModifierCodes.SHIFT,
        },
        {
            code: HotkeyModifierCodes.WILDCARD,
            name: 'Wildcard',
            description: 'Fire the hotkey even if other keys are pressed',
            group: HotkeyModifierCodes.WILDCARD,
        },
        {
            code: HotkeyModifierCodes.NO_BLOCK,
            name: 'No Block',
            description: 'Don\'t block the pressed keys from their original function',
            group: HotkeyModifierCodes.NO_BLOCK,
        },
        {
            code: HotkeyModifierCodes.USE_HOOK,
            name: 'Use Hook',
            description: 'Enable this if the resulting action may activate a hotkey or hotstring',
            group: HotkeyModifierCodes.USE_HOOK,
        },
        {
            code: HotkeyModifierCodes.UP,
            name: 'On Release',
            description: 'Activate when the key is released',
            group: HotkeyModifierCodes.UP,
        }
    ]

interface HotstringI 
{
    keys: string
    action: string
    options: HotstringOptionCodes[]
}

interface HotkeyI
{
    keys: string
    action: string
    modifiers: [string, string, string]
}

class Hotstring implements HotstringI
{
    keys: string
    action: string
    options: HotstringOptionCodes[]

    constructor(keys: string, action: string, options: HotstringOptionCodes[] = [])
    {
        this.keys = keys
        this.action = action
        this.options = options
    }
}

class Hotkey implements HotkeyI
{
    keys: string
    action: string
    modifiers: [string, string, string]

    constructor(keys: string, action: string)
    {
        this.keys = keys
        this.action = action
        this.modifiers = ['', '', '']
    }

    addModifier(modifier: HotkeyModifierCodes): void
    {

        switch (modifier)
        {
            case HotkeyModifierCodes.UP:
                this.modifiers[2] = modifier
                break
            case HotkeyModifierCodes.WILDCARD:
            case HotkeyModifierCodes.NO_BLOCK:
            case HotkeyModifierCodes.USE_HOOK:
                this.modifiers[0] += modifier
                break
            default:
                this.modifiers[1] += modifier
        }
    }
}

export { Hotstring, Hotkey, HotstringOptions, HotkeyModifierCodes, HotkeyModifiers, HotstringOptionCodes }
export type { HotkeyI, HotstringI }
