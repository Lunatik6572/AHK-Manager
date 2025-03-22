import { useState } from 'react'
import Editor from '@monaco-editor/react'

export default function HotstringEditor(): JSX.Element 
{

    const topComment: string = ['; <- This character is for comments. Anything to the right is ignored by AHK',
        '; Add some code below for your hotstring! Here\'s an example:',
        '; Send("^s") ; This will send Ctrl+S',
        '; Send("{Enter}") ; This will send Enter',
        '; MsgBox("Hello, world!") ; This will show a message box',
        '; Run "notepad.exe" ; This will run Notepad',
    ].join('\n')

    const [code, setCode] = useState(topComment)

    return (
        <>
            <Editor
                height="500px"
                defaultLanguage="ahk"
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
        </>
    )
}