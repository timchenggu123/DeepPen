FROM python:3.9.10-buster

#custom code end
ENV VIRTUAL_PORT 5000
EXPOSE $VIRTUAL_PORT
ENV FLASK_APP "routes.py"
ENV FLASK_DEBUG 1
ENV FLASK_ENV "development"

RUN apt-get update &&\
    pip3 install --upgrade pip &&\
    pip3 install \
    alembic==1.6.5 \
    bcrypt==3.2.0 \
    cffi==1.15.0 \
    click==8.0.1 \
    dnspython==2.1.0 \
    email-validator==1.1.3 \
    Flask==2.0.1 \
    Flask-Bcrypt==0.7.1 \
    Flask-Login==0.5.0 \
    Flask-Migrate==3.1.0 \
    Flask-SQLAlchemy==2.5.1 \
    Flask-WTF==0.15.1 \
    flask-cors \
    greenlet==1.1.1 \
    idna==3.2 \
    itsdangerous==2.0.1 \
    Jinja2==3.0.1 \
    Mako==1.1.5 \
    MarkupSafe==2.0.1 \
    pycparser==2.20 \
    python-dateutil==2.8.2 \
    python-editor==1.0.4 \
    pymongo \
    requests \
    six==1.16.0 \
    SQLAlchemy==1.4.23 \
    Werkzeug==2.0.1 \
    WTForms==2.3.3 &&\
    rm -rf /var/lib/apt/lists/*

RUN pip3 uninstall JWT &&\
    pip3 uninstall PyJWT &&\
    pip install PyJWT

WORKDIR /server

RUN mkdir /server/additional_files

COPY . .


RUN chmod +x /server/docker-entrypoint.sh

ENTRYPOINT ["/server/docker-entrypoint.sh"]
CMD ["python3","/server/rest.py"]

