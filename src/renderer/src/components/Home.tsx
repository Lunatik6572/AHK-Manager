import { Box, Button, Container, Typography } from "@mui/material";
import { useState, JSX, useEffect } from "react";
import * as IpcCaller from "./IpcCaller"
import { IpcMessage } from "../../../commons/common";

let keepAliveInterval: ReturnType<typeof setInterval> | undefined

function activateStatusRefresh(getStatus: () => void, interval: number): void
{
    if (keepAliveInterval !== undefined)
    {
        clearInterval(keepAliveInterval)
    }
    keepAliveInterval = setInterval(() =>
    {
        getStatus()
    }, interval)
}

enum AhkAction
{
    START,
    RESTART,
    KILL
}

export default function Home(): JSX.Element
{

    const [status, setStatus] = useState('Loading...');
    const [secondaryStatus, setSecondaryStatus] = useState('');

    useEffect(() =>
    {
        activateStatusRefresh(getStatus, 10000)
    }, [])

    const getStatus = (): void =>
    {
        console.log('getStatus')
        IpcCaller.getStatus().then((result: IpcMessage) =>
        {
            if (!result.success || result.message === '-1')
            {
                setStatus('No AHK script running')
            }
            else
            {
                setStatus(`AHK script running with PID ${result.message}`)
                setSecondaryStatus('')
            }
        })
    }

    const invokeAhk = (type: AhkAction): void =>
    {
        let caller: () => IpcCaller.promiseType
        switch (type)
        {
            case AhkAction.START:
                caller = IpcCaller.runDefaultScript
                break
            case AhkAction.RESTART:
                caller = IpcCaller.restartDefaultScript
                break
            case AhkAction.KILL:
                caller = IpcCaller.killAllAhkProcesses
                break
        }

        console.log('invokeAhk', type)
        caller().then((result: IpcMessage) =>
        {
            if (result.success)
            {
                getStatus()
            }
            else
            {
                setSecondaryStatus(` - ${result.message}`)
            }
        })
    }

    return (
        <>
            <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Main Page
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
                    <Button variant="contained" color="primary" onClick={() => invokeAhk(AhkAction.START)}>
                        Start AHK
                    </Button>
                    <Button variant="contained" color="primary" onClick={() => invokeAhk(AhkAction.RESTART)}>
                        Restart AHK
                    </Button>
                    <Button variant="contained" color="error" onClick={() => invokeAhk(AhkAction.KILL)}>
                        Stop AHK
                    </Button>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    AHK Status: {status}{secondaryStatus}
                </Typography>
            </Container>
        </>
    )
}