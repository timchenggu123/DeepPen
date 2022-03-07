FROM python:3.9.10-buster

#custom code end
ENV VIRTUAL_PORT 5000
EXPOSE $VIRTUAL_PORT
ENV FLASK_APP "routes.py" 
ENV FLASK_DEBUG 1
ENV FLASK_ENV "development"

WORKDIR /server

COPY . .

RUN apt-get update &&\
    apt-get install -y python3 python3-pip &&\
    pip3 install --upgrade pip &&\
    pip3 install -r requirement.txt &&\
    rm -rf /var/lib/apt/lists/*

RUN chmod +x /server/docker-entrypoint.sh

ENTRYPOINT ["/server/docker-entrypoint.sh"]
CMD ["python3","/server/rest.py"]

