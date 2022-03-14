FROM judge0/compilers:latest-slim AS production

ENV JUDGE0_HOMEPAGE "https://judge0.com"
LABEL homepage=$JUDGE0_HOMEPAGE

ENV JUDGE0_SOURCE_CODE "https://github.com/judge0/judge0"
LABEL source_code=$JUDGE0_SOURCE_CODE

ENV PATH "/usr/local/ruby-2.7.0/bin:/opt/.gem/bin:$PATH"
ENV GEM_HOME "/opt/.gem/"

# RUN apt-get clean

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      cron \
      libpq-dev \
      sudo && \
    rm -rf /var/lib/apt/lists/* && \
    echo "gem: --no-document" > /root/.gemrc && \
    gem install bundler:2.1.4 && \
    npm install -g --unsafe-perm aglio@2.3.0

#custom code start here
#Code required to install bazel
RUN sudo apt install apt-transport-https curl gnupg &&\
    curl -fsSL https://bazel.build/bazel-release.pub.gpg | gpg --dearmor > bazel.gpg&&\
    sudo mv bazel.gpg /etc/apt/trusted.gpg.d/ &&\
    echo "deb [arch=amd64] https://storage.googleapis.com/bazel-apt stable jdk1.8" | sudo tee /etc/apt/sources.list.d/bazel.list
#Requirements for scipy and scikit-learn
RUN apt-get update && \
    apt-get install -y bazel gfortran libopenblas-dev liblapack-dev &&\
    rm -rf /var/lib/apt/lists/*
    
#Requirement for ONNX
RUN apt-get update && \
    apt-get -y install cmake protobuf-compiler libprotoc-dev&&\
    rm -rf /var/lib/apt/lists/*

#Requirement for cv2
RUN apt-get update &&\
    apt-get install ffmpeg libsm6 libxext6  -y &&\
    rm -rf /var/lib/apt/lists/*

#############install conda
ENV CONDA_DIR /opt/conda
RUN wget --quiet https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda.sh && \
     /bin/bash ~/miniconda.sh -b -p /opt/conda &&\
     rm -rf ~/miniconda.sh
ENV PATH=$CONDA_DIR/bin:$PATH

SHELL ["/bin/bash", "-c"] 


############install python 3.8
RUN conda init && \
    source /root/.bashrc&&\
    yes | conda create -p /usr/local/python_3.8 python=3.8 && conda activate /usr/local/python_3.8 &&\
    pip install \
    virtualenv \
    numpy \
    torch \ 
    torchvision \
    mlxtend \
    pandas \
    scikit-learn \   
    cleverhans \
    scipy

RUN conda init && \ 
    source /root/.bashrc &&\
    conda activate /usr/local/python_3.8 &&\pip install \
    typing-extensions \
    tensorflow==2.2 \
    tensorflow-addons==0.10.0

RUN conda init && \ 
    source /root/.bashrc &&\
    conda activate /usr/local/python_3.8 &&\pip install \
    pip install \
    onnx \
    onnx-tf 

############install python 3.9
RUN conda init && \
    source /root/.bashrc&&\
    yes | conda create -p /usr/local/python_3.9 python=3.9 && conda activate /usr/local/python_3.9 &&\
    pip install \
    virtualenv \
    numpy \
    torch \ 
    torchvision \
    mlxtend \
    pandas \
    scikit-learn \   
    cleverhans \
    scipy

RUN conda init && \ 
    source /root/.bashrc &&\
    conda activate /usr/local/python_3.8 &&\pip install \
    typing-extensions \
    tensorflow==2.5 \
    tensorflow-addons==0.13.0

RUN conda init && \ 
    source /root/.bashrc &&\
    conda activate /usr/local/python_3.8 &&\pip install \
    onnx \
    onnx-tf 

RUN conda init && \ 
    source /root/.bashrc &&\
    conda activate /usr/local/python_3.8 &&\pip install \
    cleverhans==3.1.0 \
    entrypoints==0.3 \
    future==0.18.2 \
    Jinja2==2.11.2 \
    joblib==0.16.0 \
    Keras==2.3.1 \
    Keras-Applications==1.0.8 \
    Keras-Preprocessing==1.1.2 \
    matplotlib==3.2.2 \
    mistune==0.8.4 \
    mnist==0.2.2 \
    numpy==1.18.5 \
    protobuf==3.12.2 \
    scikit-image==0.17.2 \
    scikit-learn==0.23.1 \
    scipy==1.4.1 \
    sklearn==0.0 \
    tensorboard==2.2.2 \
    tensorboard-plugin-wit==1.7.0 \
    tensorflow==2.2.0 \
    tensorflow-addons==0.10.0 \
    tensorflow-estimator==2.2.0 \
    tensorflow-probability==0.10.1 \
    tf-explain==0.2.1 \
    pandas==1.0.5 \
    func-timeout==4.3.5 \
    tqdm==4.48.0 
# #custom code end
ENV VIRTUAL_PORT 2358
EXPOSE $VIRTUAL_PORT

WORKDIR /api

COPY Gemfile* ./
RUN RAILS_ENV=production bundle

COPY cron /etc/cron.d
RUN cat /etc/cron.d/* | crontab -

COPY . .

ENTRYPOINT ["/api/docker-entrypoint.sh"]
CMD ["/api/scripts/server"]

ENV JUDGE0_VERSION "1.13.0"
LABEL version=$JUDGE0_VERSION

# FROM production AS development

# ARG DEV_USER=judge0
# ARG DEV_USER_ID=1000

# # RUN apt-get update && \
# #     apt-get install -y --no-install-recommends \
# #         vim && \
# RUN useradd -u $DEV_USER_ID -m -r $DEV_USER && \
#     echo "$DEV_USER ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers
# USER $DEV_USER
# CMD ["sleep", "infinity"]
