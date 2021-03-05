## Docker enabled Bot deployment

This repo provides state-of-the-art bot platform built using open source software.

Overview
--------

<b>Why Docker ?</b>

To shift from traditional waterfall to  modern DevOps approach of software delivery, one needs a distributed microservice architecture using Docker and Kubernetes.
The option of using Docker is portable, flexible and easy to deploy.

It makes use of docker-compose tool for running multi-container applications on Docker defined using the Compose file format.(docker-compose.yml)
A Compose file is used to define how one or more containers that make up your application are configured.

Docker Compose tool is already included in Docker Desktop for Windows and macOS.

Prerequisite
-----------

Download [Docker Desktop for Mac or Windows](https://store.docker.com/editions/community/docker-ce-desktop-windows) . [Docker Compose](https://docs.docker.com/compose) will be automatically installed. On Linux, make sure you have the latest version of [Compose](https://docs.docker.com/compose/install/).

Architecture
------------
Bot platform requires following services -  
    
- Broker Engine - consist of Zookeeper (Container #1) and Kafka (Container #2)
- NLP Engine - (Container #3)
- Dialog Engine - (Container #4)

The architecture shows different services and their interaction -

<img src="https://github.com/hmi-digital/bot_platform/blob/main/Documents/architecture.png" alt="Platform Architecture"/>

Getting Started
---------------

+ Clone or download this repo to your preferred directory
+ You should have following folder structure

    - DialogEngine
    - Documents
    - NLPEngine
    - docker-compose.yml

+ Run all the services using below command

```
$ docker-compose up -d
```

+ If you want to stop the container use below command

```
$ docker-compose down
```

+ Above command will run a sample trip booking use case
+ Bot is now ready to interact at port 5002 
+ Go to chrome browser and enter URL - https://\<Your Machine IP\>:5002
+ You can test bot using sample conversation shown below

```
Here is a sample conversation - 
Bot: Good evening, How may I help you?
User: Good evening
Bot: Good evening, Friend, hope you are doing good today. How may I help you?
User: I want to book a ticket
Bot: Please tell me what city do you want to travel?
User: I want to start from Atlanta
Bot: And for how many persons?
User: How is weather in Atlanta?
Bot: The temperature in Atlanta is 21.54 degrees. for how many persons?
User: for 4 persons
Bot: When do you want to leave?
User: I want to leave on Sunday
Bot: which class do you want to travel?
User: Business
Bot: Hey John, this trip to Atlanta costs 255 Dollars. What can I do for you?
```

Go through the detailed document located here to understand the different features and functionalities of BOT platform

License
-------

MIT