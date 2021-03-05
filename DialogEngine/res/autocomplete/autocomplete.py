# -*- coding: utf-8 -*-
import sys
from module import processUtterance as pu
from module import trainModel

utterance = sys.argv[1]

trainModel.loadModel()

result = pu.processUtterance(utterance)
jResult = {'list':result}
newjResult = str(jResult).replace("'",'"').strip()
sys.stdout.buffer.write(newjResult.encode('utf8'))