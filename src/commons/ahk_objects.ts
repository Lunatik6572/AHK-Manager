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
    ALT = '!',
    CTRL = '^',
    SHIFT = '+',
    LEFT = '<',
    RIGHT = '>',
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
            leftRight: true
        },
        {
            code: HotkeyModifierCodes.ALT,
            name: 'Alt',
            description: 'Alt key',
            leftRight: true
        },
        {
            code: HotkeyModifierCodes.CTRL,
            name: 'Ctrl',
            description: 'Ctrl key',
            leftRight: true
        },
        {
            code: HotkeyModifierCodes.SHIFT,
            name: 'Shift',
            description: 'Shift key',
            leftRight: true
        },
        {
            code: HotkeyModifierCodes.WILDCARD,
            name: 'Wildcard',
            description: 'Fire the hotkey even if other keys are pressed',
            leftRight: false
        },
        {
            code: HotkeyModifierCodes.NO_BLOCK,
            name: 'No Block',
            description: 'Don\'t block the pressed keys from their original function',
            leftRight: false
        },
        {
            code: HotkeyModifierCodes.USE_HOOK,
            name: 'Use Hook',
            description: 'Enable this if the reulting action may activate a hotkey or hotstring',
            leftRight: false
        },
        {
            code: HotkeyModifierCodes.UP,
            name: 'On Release',
            description: 'Activate when the key is released',
            leftRight: false
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

    addModifer(modifier1: HotkeyModifierCodes, modifier2?: HotkeyModifierCodes): void
    {
        const modifier: string = modifier1 + (modifier2 ?? '')

        switch (modifier1)
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

export { Hotstring, Hotkey, HotstringOptions, HotkeyModifierCodes, HotkeyModifiers }
export type { HotkeyI, HotstringI }
