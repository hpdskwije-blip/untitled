' NENAPIYUMA AI USB - Silent Background Launcher
' Allows double-click execution on Windows without flashing a black CMD window
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "NENAPIYUMA.bat" & Chr(34), 0
Set WshShell = Nothing
