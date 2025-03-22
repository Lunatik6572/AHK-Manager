import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import { AHK_LANGUAGE_ID } from '../../commons/common';

self.MonacoEnvironment = {
    getWorker(_, label): Worker
    {
        if (label === 'json')
        {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less')
        {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor')
        {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript')
        {
            return new tsWorker();
        }
        return new editorWorker();
    },
}

export default function ConfigureMonaco(): void
{
    loader.config({ monaco });

    loader.init()

    monaco.languages.register({ id: AHK_LANGUAGE_ID })

    // monaco.languages.setMonarchTokensProvider(AHK_LANGUAGE_ID, {
    //     tokenizer: {

    //     },
    // })
}
