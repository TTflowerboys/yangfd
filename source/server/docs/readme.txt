*Steps that make auto-generating documentation works*

sed -i 's/f_project/slug/g' index.rst conf.py
sed -i 's/F_PROJECT/FULL_PROJECT_NAME/g' index.rst conf.py
