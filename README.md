# DeepPen
## Quick Start:
Make sure you have docker installed
run the following code to build containers for the sandbox and backend:
`./sandbox/build.sh`
`./backend/build.sh`

run the following code to run the containers:
`cd ./sandbox && docker-compose up`
`cd ../`
`cd ./backend && docker-compose up`

The sandbox is hosted on `localhost:2358` and the backend is `localhost:6969`

To run the ide frontend, simply open the ide.html file. Press F10 to edit url endpoint. It should work directly with the sandbox endpoint on `http://127.0.0.1:2358`

TO RUN REST MONGODB BACKEND: 
do python3 rest.py, the endpoint would be at localhost:6969. To verify mongodb structure, user MongoDB Compass for visulization or use Postman for API calls.
Only the file rest.py is for this feature. 
