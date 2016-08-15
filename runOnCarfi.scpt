on adding folder items to thisFolder after receiving theseItems
	repeat with thisItem in theseItems
		try
			set fileTarget to "CARFI"
			fileTarget as alias
			display dialog "CARFI found - running Spotify script"
			do shell script POSIX path of thisItem & "carfi.sh"
      display dialog "CARFI music updated"
		on error
			-- display dialog "Its another USB Stick"
		end try
	end repeat
end adding folder items to
