# -*- coding: utf-8 -*-
import re

def normRsplit(text,n): return text.lower().rsplit(' ', n)[-n:]

def reSplit(text): return re.findall('[a-z]+', text.lower())

def chunks(l, n):
    for i in range(0, len(l) - n + 1):
        yield l[i:i+n]
