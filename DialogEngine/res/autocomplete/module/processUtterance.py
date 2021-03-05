# -*- coding: utf-8 -*-
from collections import Counter
import operator
from . import trainModel
from . import utils

NEARBY_KEYS = {
    'a': 'qwsz',
    'b': 'vghn',
    'c': 'xdfv',
    'd': 'erfcxs',
    'e': 'rdsw',
    'f': 'rtgvcd',
    'g': 'tyhbvf',
    'h': 'yujnbg',
    'j': 'uikmnh',
    'k': 'iolmj',
    'l': 'opk',
    'm': 'njk',
    'n': 'bhjm',
    'o': 'iklp',
    'p': 'ol',
    'q': 'wa',
    'r': 'edft',
    's': 'wedxza',
    't': 'rfgy',
    'u': 'yhji',
    'v': 'cfgb',
    'w': 'qase',
    'x': 'zsdc',
    'y': 'tghu',
    'z': 'asx'
    }


def thisWord(word, top_n=10):
    """given an incomplete word, return top n suggestions based off
    frequency of words prefixed by said input word"""
    try:
        return [(k, v) for k, v in trainModel.WORDS_MODEL.most_common()
                if k.startswith(word.lower())][:top_n]
    except KeyError:
        raise Exception("ERROR: Could not process, check if trained model exists")

def thisWordGivenLast(first_word, second_word, top_n=10):
    """given a word, return top n suggestions determined by the frequency of
    words prefixed by the input GIVEN the occurence of the last word"""
    possibleSecondWords = [second_word[:-1]+char
                             for char in NEARBY_KEYS[second_word[-1]]
                             if len(second_word) > 2]

    possibleSecondWords.append(second_word)

    probableWords = {w:c for w, c in
                      trainModel.WORD_TUPLES_MODEL[first_word.lower()].items()
                      for sec_word in possibleSecondWords
                      if w.startswith(sec_word)}

    return Counter(probableWords).most_common(top_n)

def predict(first_word, second_word=None, top_n=10):
	try:
		if second_word is None:
			return [x for x in thisWord(first_word) if x[0] != first_word.lower()]

		elif not second_word:
			if (first_word.lower() in trainModel.WORD_TUPLES_MODEL.keys()):
				return sorted(trainModel.WORD_TUPLES_MODEL[first_word.lower()].items(), key=operator.itemgetter(1),reverse=True)[:top_n]
			else:
				return []
		elif first_word and second_word:
			return thisWordGivenLast(first_word, second_word, top_n=top_n)
			
		else:
			return thisWord(first_word, top_n)

	except KeyError:
		raise Exception("ERROR:Please load train Model. Run:trainModel.loadModel()")


def splitPredict(text, top_n=10):
    """takes in string and will right split accordingly.
    Optionally, you can provide keyword argument "top_n" for
    choosing the number of suggestions to return (default is 10)"""
    text = utils.normRsplit(text, 2)
    return predict(*text, top_n=top_n)

def processUtterance(utterance):
    fWord = None
    sWord = None
    #No utterance
    if (utterance is None) or (not utterance):
        return []
    
    #Single word
    elif (len(utterance.split()) == 1):
        #Single incomplete word
        if (utterance[-1] != ' '):
            fWord = utterance.split()[-1]
            return [x[0] for x in predict(fWord)]
        
        #Single Word completed and beginning of second word
        elif (utterance[-1] == ' '):
            fWord = utterance.split()[-1]
            sWord = ''
            return [x[0] for x in predict(fWord,sWord)]
    
    #Sentence with (earlier) first word present        
    #second word still not completed
    elif(utterance[-1] != ' '):
        fWord = utterance.split()[-2]
        sWord = utterance.split()[-1]
        return [x[0] for x in predict(fWord,sWord)]
    
    elif(utterance[-1] == ' '):
        fWord = utterance.split()[-1]
        sWord = ''
        return [x[0] for x in predict(fWord,sWord)]