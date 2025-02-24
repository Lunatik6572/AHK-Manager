#Requires AutoHotkey >=v2.0 64-bit
#SingleInstance Force
DetectHiddenWindows true

thisHWND := WinExist("Ahk_PID " DllCall("GetCurrentProcessId"))

Class KeepAliveTimer
{
    __New()
    {
        this.interval := 5000
        this.timer := ObjBindMethod(this, "timedOut")
    }

    timedOut()
    {
        stdOut("No keep alive recieved in time. Parent process likely terminated.")
        SetTimer this.timer, 0
        kill(15, 1, "", thisHWND)
    }

    start()
    {
        SetTimer this.timer, this.interval
    }

    update()
    {
        stdOut("Keep alive signal received")
        SetTimer this.timer, this.interval
    }
}

stdOut(text := "", end := "`n")
{
    stdIo("*", text . end)
}

stdErr(text := "", end := "`n")
{
    stdIo("**", text . end)
}

stdIo(outFile, text)
{
    out := 0
    try
    {
        out := FileOpen(outFile, "w")
        out.Write(text)
    }

    If out
    {
        out.Close()
    }
}

/**
 * Kill the process.
 * 
 * Use `wParam := 30` to reload the script.
 * 
 * @param wParam kill code
 * @param lParam exit code
 * @param msg window message
 * @param hwnd hwnd of message origin
 */
kill(wParam, lParam, msg, hwnd)
{
    stdout("Kill command from " . hwnd)
    stdout("Kill code: " . wParam)
    stdout("Exit code: " . lParam)

    ; Reload script
    if wParam == 30
    {
        stdout("Kill code for reload invoked")
        stdout("Script reloading...")
        Reload
        ; We should never reach here
        Sleep 1000
        stderr("The script could not reload. Script will be killed instead...")
    }

    ExitApp lParam
}

keepAlive(ignored*)
{
    keepAliveObj.update()
}

OnMessage(DllCall("RegisterWindowMessage", "Str", "KillAHK"), kill)
OnMessage(DllCall("RegisterWindowMessage", "Str", "KeepAlive"), keepAlive)
keepAliveObj := KeepAliveTimer()
keepAliveObj.start()
Persistent()
