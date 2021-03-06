# -*- coding: utf-8 -*-
import json
import re
from utils import nlp_config
from utils import log_util
from core.classifiers.tfidf import train_tfidf
from core.classifiers.nlu import train_nlu
from warnings import simplefilter

simplefilter(action='ignore')


def train(domain, locale):
    response = json.loads('{"response":"ERROR: Error during training the data"}')

    if not nlp_config.check_data_available:
        log_util.log_errormsg("[TRAIN_MODEL] no intent data found. Exiting...")
        return response

    if re.search(nlp_config.get_parameter('ENSEMBLE'), 'true', re.IGNORECASE):
        if nlp_config.get_parameter('ALGORITHM') == 'TFIDF':
            train_nlu.train(domain, locale)
            #tfidf becomes the base algorithm
            response = train_tfidf.train(domain, locale)
        elif nlp_config.get_parameter('ALGORITHM') == 'NLU':
            train_tfidf.train(domain, locale)
            #nlu becomes the base algorithm
            response = train_nlu.train(domain, locale)
    else:
        if nlp_config.get_parameter('ALGORITHM') == 'TFIDF':
            response = train_tfidf.train(domain, locale)
        elif nlp_config.get_parameter('ALGORITHM') == 'NLU':
            response = train_nlu.train(domain, locale)
        else:
            log_util.log_errormsg("[TRAIN_MODEL] configured algorithm is not supported. Exiting...")
    return response


if __name__ == "__main__":
    train()
