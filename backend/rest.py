from cgitb import reset
from cmath import e
from distutils.log import debug
from flask import Flask, Response, request
from flask_cors import CORS, cross_origin
import pymongo
import json
from types import SimpleNamespace
from bson.objectid import ObjectId
import requests
from flask_bcrypt import Bcrypt,generate_password_hash, check_password_hash
import bcrypt
import datetime
import jwt
from enum import Enum

class ProjectType(int, Enum):
    PY_TORCH = 1
    TENSORFLOW = 2


app = Flask(__name__)
CORS(app, support_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'

sandboxUrl = "sandbox:2358"
wait = False
CURR_USER_ID = ""

try:
    mongo = pymongo.MongoClient(
        "mongodb+srv://martin:DeepPen@cluster0.ldso5.mongodb.net/DeepPen?retryWrites=true&w=majority"
    )
    # mongo = pymongo.MongoClient(
    #     host = [ str("mongodb") + ":" + str(27017) ],
    #     serverSelectionTimeoutMS = 3000, # 3 second timeout
    #     username = "root",
    #     password = "DeepPenetration",
    # )
    db = mongo.db
    mongo.server_info()
    print("Successfully connected to db")
except:
    print("ERROR - Cannot connect to db")

def auth(request):
    request_token = request.headers.get("Authorization")
    stored_token = db.tokens.find_one({"token" : request_token, "valid": True})
    if stored_token:
        return stored_token
    else:
        return False

def generate_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1, seconds=69),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(
        payload,
        "DeepPenetration",
        algorithm='HS256'
    )


@app.before_request
def authenticate():
    if request.endpoint != "login" and request.endpoint != "register":
        if not auth(request):
            return Response(
                status=401
            )


################################# PROJECTS
@app.route("/projects", methods=["GET"])
@cross_origin(supports_credentials=True)
def get_all_projects():
    try:
        projects = db.projects.find({"user_id": CURR_USER_ID})

        return Response(
            response= json.dumps({"projects" : projects}),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": "Unable to get all projects", "ex": ex.message}),
            status= 500,
            mimetype="application/json",
        )


@app.route("/projects/<project_id>", methods=["GET"])
@cross_origin(supports_credentials=True)
def get_project_by_id(project_id):
    try:
        projects = db.projects.find({"_id": project_id})

        return Response(
            response= json.dumps({"projects" : projects}),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": f"Unable to get project {project_id}", "ex": ex.message}),
            status= 500,
            mimetype="application/json",
        )


def create_project(body):
    d = datetime.datetime.utcnow()

    instance = {
        **body,
        "created_at": d,
        "updated_at": d,
        "submission_ids": []
    }

    dbResponse = db.projects.insert_one(instance)
    return dbResponse.inserted_id



@app.route("/projects", methods=["POST"])
@cross_origin(supports_credentials=True)
def save_project():
    try:
        body = request.get_json()

        # project_id is not given
        # creates new project
        if not body["project_id"]:
            project_id = create_project(body)

            return Response(
                response= json.dumps({"message": "created and saved project", "project_id": project_id}),
                status= 200,
                mimetype="application/json",
            )

        else:
            project_id = body["project_id"]
            project = db.projects.find_one({"_id": project_id})

            if (project == None):
                project_id = create_project(body)

            if (body["make_default"] == True):
                dbResponse = db.users.update_one({"_id": CURR_USER_ID}, {"default_project": project_id})

            dbResponse = db.projects.update_one({"_id": project_id}, body)

            if (not dbResponse.matchedCount == 0 and not dbResponse.modifiedCount == 0):
                return Response(
                    response= json.dumps({"message": "project saved/updated"}),
                    status= 200,
                    mimetype="application/json",
                )
            else:
                return Response(
                    response= json.dumps({"message": f"Unable to update project {project_id}"}),
                    status= 500,
                    mimetype="application/json",
                )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": f"Unable to update project {project_id}", "ex": ex.message}),
            status= 500,
            mimetype="application/json",
        )

################################# SUBMISSIONS
@app.route("/projects/<project_id>/submissions/<submission_token>", methods=["GET"])
@cross_origin(supports_credentials=True)
def get_submission(project_id, submission_token):
    try:
        url = sandboxUrl + f"/submissions/{submission_token}/?base64_encoded=true"
        submission = requests.get(url)

        # find submission and save the test results
        data = submission.get_json()
        print(data)

        instance = {
            "data_samples": data["data"],
            "test_stats": data["results"]
        }

        dbResponse= db.submissions.find_one_and_update({"token": submission_token}, {instance})
        if (dbResponse.matchedCount <= 0 and dbResponse.modifiedCount <= 0):
                return Response(
                    response= json.dumps({"message": f"Unable to save results for submission {submission_token}"}),
                    status= 500,
                    mimetype="application/json",
                )

        submission = db.submissions.find_one({"token": submission_token})

        return Response(
            response= json.dumps({submission}),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": f"Unable to fetch submission {submission_token}", "ex": ex.message}),
            status= 500,
            mimetype="application/json",
        )


@app.route("/projects/<project_id>/submissions", methods=["GET"])
@cross_origin(supports_credentials=True)
def get_all_project_submissions(project_id):
    try:
        projects = db.projects.find({"_id": project_id})

        submissions = []
        for id in projects["submission_ids"]:
            submissions.append(db.submissions.find_one({"_id": id}))

        return Response(
            response= json.dumps({"projects" : submissions}),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": f"Unable to fetch submissions for project {project_id}", "ex": ex.message}),
            status= 500,
            mimetype="application/json",
        )


@app.route("/projects/<project_id>/submissions", methods=["POST"])
@cross_origin(supports_credentials=True)
def handle_submission(project_id):
    try:
        args = request.args
        body = request.get_json()

        url = sandboxUrl + f"/submissions?base64_encoded=true&wait={args['wait']}"
        submission = requests.post(url, data=body)

        res = submission.json()
        token = res["token"]

        instance = {
            "project_id" : project_id,
            "token": token,
            "params": body,
        }

        dbResponse= db.submissions.insert_one(instance)
        print(dbResponse.inserted_id)

        # Find project and save the submission id
        project = db.projects.find_one({"_id": project_id})

        if (project == None):
            return Response(
                response= json.dumps({"message": f"Unable to find project {project_id}"}),
                status= 500,
                mimetype="application/json",
            )

        updated_submission_ids = project["submission_ids"].copy()
        updated_submission_ids.append(dbResponse.inserted_id)
        d = datetime.datetime.utcnow()

        dbResponse = db.project.update_one(
            {"_id" : project["_id"]},
            {
                "submission_ids":updated_submission_ids,
                "updated_at": d
            })
        print(dbResponse.inserted_id)

        return Response(
            response= json.dumps({"token" : token}),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": "Unable to submit submission", "ex": ex.message}),
            status= 500,
            mimetype="application/json",
        )


############################## AUTH
@app.route("/register", methods=["POST"])
def register():
    try:
        request_data = request.get_json()
        db.users.insert_one({
            "username": request_data['user'],
            "password": bcrypt.hashpw(request_data['password'].encode('utf-8'), bcrypt.gensalt(10))
        })
        return Response(
            response= json.dumps({
                "message": "This is a test",
            }),
            status=200,
        )
    except Exception as ex:
        return Response(
            response= json.dumps({"exception": ex}),
            status=500
        )


@app.route("/login", methods=["POST"])
def login():
    try:
        print("Logging in...")
        request_data = request.get_json()
        print(request_data)
        user = db.users.find_one({
            "username": request_data['user']
        })

        user["_id"] = str(user["_id"])
        if not bcrypt.checkpw(request_data["password"].encode('utf-8'), user["password"]):
            return Response(
                status=401
            )
        del user["password"]

        user_token = generate_token(user["_id"])
        db.tokens.update_many({"user" : ObjectId(user["_id"])}, {"$set": {"valid": False}})
        db.tokens.insert_one({"user": ObjectId(user["_id"]), "token": user_token, "valid": True})

        CURR_USER_ID = user["_id"]

        return Response(
            response= json.dumps({
                "user": json.dumps(user),
                "token": user_token
            }),
            status=200
        )
    except Exception as ex:
        return Response(
            response= json.dumps({"exception": f"{ex}"}),
            status=500
        )

@app.route("/logout", methods=["POST"])
def login():
    try:
        request_data = request.get_json()
        user = db.users.find_one({
            "username": request_data['user']
        })

        user["_id"] = str(user["_id"])
        if not bcrypt.checkpw(request_data["password"].encode('utf-8'), user["password"]):
            return Response(
                status=401
            )

        db.tokens.update_many({"user" : ObjectId(user["_id"])}, {"$set": {"valid": False}})

        return Response(
            response= json.dumps({
                "message": "Successfully logged out",
            }),
            status=200
        )
    except Exception as ex:
        return Response(
            response= json.dumps({"exception": f"{ex}"}),
            status=500
        )


@app.route("/test", methods=["POST"])
def test():
    if auth(request):
        return Response(status=200)
    else:
        return Response(status=401)


@app.route("/user/<id>", methods=["GET"])
def user(id):
    try:
        auth(request)
        user = db.users.find_one({"_id": ObjectId(id)})
        del user["password"]
        user["_id"] = str(user["_id"])
        return Response(
            response= json.dumps({
                "user": json.dumps(user)
            }),
            status=200
        )
    except Exception as ex:
        print(ex)
        return Response(
            status=500
        )

@app.after_request
def apply_header(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,HEAD,OPTIONS,POST,PUT"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"

    return response

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6969, debug=True)
