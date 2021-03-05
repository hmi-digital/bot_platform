# -*- coding: utf-8 -*-
import json
import os
import re
import sys, getopt
import threading
from warnings import simplefilter

import flask
from flask import request, abort, make_response, jsonify
from utils import nlp_config
from utils import log_util
from core import train_model, predict_model
from pubsub import consumer
from pubsub import process_message
from pubsub import producer as pr
from pubsub import create_topics

# ignore all warnings
simplefilter(action='ignore')
scriptDir = os.path.dirname(__file__)

app = flask.Flask(__name__)
SERVER_HOST = ''
SERVER_PORT = None
IS_BROKER = False


def initialise():
    # load all the config parameters
    nlp_config.load_parameters()
    global SERVER_HOST
    global SERVER_PORT
    global IS_BROKER
    SERVER_HOST = '0.0.0.0'
    SERVER_PORT = nlp_config.get_parameter('PORT')
    IS_BROKER = re.search(nlp_config.get_parameter('USE_BROKER'), 'true', re.IGNORECASE)


@app.route('/train', methods=['POST'])
def trainDomain():
    if not (request.args.get('domain')):
        log_util.log_errormsg("[APP] missing domain parameter")
        abort(404)
    if request.args.get('locale'):
        locale = request.args.get('locale')
    else:
        locale = 'en'
    domain = request.args.get('domain')
    res = train_model.train(domain, locale)
    n = int(json.loads(res)["utterances"])

    if re.search(nlp_config.get_parameter('ENSEMBLE'), 'true', re.IGNORECASE):
        md = 'ENSEMBLE'
    else:
        if nlp_config.get_parameter('ALGORITHM') == 'TFIDF':
            md = 'TFIDF'
        else:
            algo = os.path.splitext(nlp_config.get_parameter('CONFIG_FILE'))[0]
            algo = algo.split("_")[1].upper()
            md = 'NLU:' + algo

    if n > 0:
        response = {"messageId": "TRAIN_SUCCESS", "domain": domain, "locale": locale, "message": res, "model": md}
    else:
        response = {"messageId": "TRAIN_FAIL", "domain": domain, "locale": locale, "message": res, "model": md}

    return make_response(jsonify(response), 200,
                         {'Content-Type': 'application/json; charset=utf-8'})


@app.route('/predict', methods=['POST'])
def predict_query():
    if not (request.args.get('domain') or request.args.get('userUtterance')):
        log_util.log_errormsg("[APP] missing parameters")
        abort(404)
    if request.args.get('locale'):
        locale = request.args.get('locale')
    else:
        locale = 'en'
    utter = request.args.get('userUtterance')
    if locale == 'en':
        utterance = re.sub(r'[^a-zA-Z ]', '', utter)
    domain = request.args.get('domain')

    if re.search(nlp_config.get_parameter('ENSEMBLE'), 'true', re.IGNORECASE):
        md = 'ENSEMBLE'
    else:
        if nlp_config.get_parameter('ALGORITHM') == 'TFIDF':
            md = 'TFIDF'
        else:
            algo = os.path.splitext(nlp_config.get_parameter('CONFIG_FILE'))[0]
            algo = algo.split("_")[1].upper()
            md = 'NLU:' + algo
    res = {"messageId": "PREDICT", "domain": domain, "locale": locale, "userUtterance": utterance, "model": md,
           "message": predict_model.predict(domain, locale, utterance)}
    return make_response(jsonify(res), 200,
                         {'Content-Type': 'application/json; charset=utf-8'})


@app.route('/health', methods=['GET'])
def health_query():
    res = {"status": "OK"}
    return make_response(jsonify(res), 200,
                         {'Content-Type': 'application/json; charset=utf-8'})


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'response': 'ERROR: Please check your query parameter'}), 404,
                         {'Content-Type': 'application/json; charset=utf-8'})


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


def listener_thread():
    log_util.log_infomsg("[APP] starting broker listener thread")
    # create the topics
    log_util.log_infomsg("[APP] creating the topics")
    create_topics.create()
    # initialise the producer
    log_util.log_infomsg("[APP] creating the producer")
    pr.initialise()
    # Run consumer listener to process all the NLP_TO_BOT messages
    consumer_ = consumer.initialise(nlp_config.get_parameter('TOPIC_BOT_TO_NLP'))
    log_util.log_infomsg("[APP] checking for any messages")
    for msg in consumer_:
        log_util.log_infomsg(msg)
        t = threading.Thread(target=process_message.process, args=(msg,))
        t.start()


def main(argv):
    port_val = ''
    use_broker = False
    initialise()
    try:
        opts, args = getopt.getopt(argv, 'hbp:', ['help', 'broker', 'port='])
    except getopt.GetoptError:
        print('app.py -p <port> -b (optional-use if broker services required)')
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print('app.py -p <port> -b (optional-use if broker services required)')
        if opt in ('-b', '--broker'):
            use_broker = True
            log_util.log_infomsg(f'[APP] broker services is set to : {use_broker}')
        if opt in ('-p', '--port'):
            port_val = arg
            log_util.log_infomsg(f'[APP] setting up NLP Engine port: {port_val}')

    if port_val:
        global SERVER_PORT
        SERVER_PORT = port_val
    if use_broker:
        global IS_BROKER
        IS_BROKER = True

    if IS_BROKER:
        log_util.log_infomsg("[APP] broker based NLPEngine enabled")
        t = threading.Thread(target=listener_thread, daemon=True)
        t.start()

    else:
        log_util.log_infomsg("[APP] REST API based NLPEngine enabled")

    if re.search(nlp_config.get_parameter('HTTPS'), 'true', re.IGNORECASE):
        context_ = ('keys/nlp.crt', 'keys/nlp.pem')
        app.run(debug=False, host=SERVER_HOST, port=SERVER_PORT, threaded=True, ssl_context=context_)
    else:
        app.run(debug=False, host=SERVER_HOST, port=SERVER_PORT, threaded=True)


if __name__ == '__main__':
    main(sys.argv[1:])
