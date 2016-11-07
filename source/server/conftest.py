import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from app import f_app  # noqa

import libfelix.f_user  # noqa
import libfelix.f_util  # noqa

f_app.mock_data = {}
f_app.common.test = True
f_app.common.log_ready = True

# Mask hasinit() for libfelix
import _pytest.python  # noqa
_pytest.python.hasinit = lambda x: hasattr(x, "_test_ignore")
