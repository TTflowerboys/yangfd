Localization Usage

1. Extract Stings file from code

	```
	ag "STR\(" > localization.txt
	```

2. Generate strings file

	```
	python gen_strings.py localization.txt > gen.strings
	```

3. Group strings file

	```
	python group_strings.py gen.strings > group_gen.strings
	```
	
4. (Optional, only for first time) Reverse update code base one the strins

	```
	# put first parameter is the strings file path, second paramter is the source code file path root
	python reverse_update_strings.py ../../group_gen.strings ../..
	```


