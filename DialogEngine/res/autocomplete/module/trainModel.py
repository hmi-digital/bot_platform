# -*- coding: utf-8 -*-
import os
import collections
import pickle
import codecs
from . import utils

WORDS = []
WORD_TUPLES = []
WORDS_MODEL = {}
WORD_TUPLES_MODEL = {}

def trainModel(corpus, model_name="trainedCorpus.pkl"):
    global WORDS
    WORDS = utils.reSplit(corpus)

    global WORDS_MODEL
    WORDS_MODEL = collections.Counter(WORDS)

    global WORD_TUPLES
    WORD_TUPLES = list(utils.chunks(WORDS, 2))

    global WORD_TUPLES_MODEL
    WORD_TUPLES_MODEL = {first:collections.Counter()
                         for first, second in WORD_TUPLES}

    for tup in WORD_TUPLES:
        try:
            WORD_TUPLES_MODEL[tup[0]].update([tup[1]])
        except:
            pass

    if model_name:
        saveModel(os.path.join(os.path.dirname(__file__),'..','model', model_name))


def trainCorpus():

    corpusPath = os.path.join(os.path.dirname(__file__),'..','data', 'corpus.txt')
    with codecs.open(corpusPath, 'rb', encoding='utf-8') as txtfile:
        trainModel(str(txtfile.read()))


def saveModel(path=None):

    if path == None:
        path = os.path.join(os.path.dirname(__file__),'..','model', 'trainedCorpus.pkl')

    #print("INFO:Saving trained model to: ", path)
    pickle.dump({'words_model': WORDS_MODEL,
                 'word_tuples_model': WORD_TUPLES_MODEL},
                open(path, 'wb'),
                protocol=2)

def loadModel(load_path=None):

    if load_path is None:
        load_path = os.path.join(os.path.dirname(__file__),'..','model', 'trainedCorpus.pkl')
    try:
        models = pickle.load(open(load_path,'rb'))

        global WORDS_MODEL
        WORDS_MODEL = models['words_model']
        global WORD_TUPLES_MODEL
        WORD_TUPLES_MODEL = models['word_tuples_model']
        #print("INFO:successfully loaded: trainedCorpus.pkl")
    except IOError:
        #print("INFO:Could not find trained model. Training it from loaded corpus")
        trainCorpus()
    except KeyError:
        #print("ERROR:Error in loading train models.")
        trainCorpus()
    except ValueError:
        #print("Error:Corrupted pickle string.")
        trainCorpus()
