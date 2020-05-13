FROM python:3

# set a directory for the app
WORKDIR /usr/src/app

# copy all the files to the container
COPY . .

# install dependencies
RUN pip install -e .

# define the port number the container should expose
EXPOSE 8000

# run the command
CMD ["bin/run"]

