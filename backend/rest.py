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

sandboxUrl = "http://127.0.0.1:2358"
wait = False
CURR_USER_ID = ""

try:
    # mongo = pymongo.MongoClient(
    #     "mongodb+srv://martin:DeepPen@cluster0.ldso5.mongodb.net/DeepPen?retryWrites=true&w=majority"
    # )
    mongo = pymongo.MongoClient(
        host = [ str("mongodb") + ":" + str(27017) ],
        serverSelectionTimeoutMS = 3000, # 3 second timeout
        username = "root",
        password = "DeepPenetration",
    )
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
    if request.endpoint != "login":
        if not auth(request):
            return Response(
                status=401
            )


################################# PROJECTS
@app.route("/projects", methods=["GET"])
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


@app.route("/projects", methods=["POST"])
def create_project():
    try:
        d = datetime.datetime.utcnow()
        name = ""
        project_type = ProjectType.TENSORFLOW
        user_id = ""

        instance = {
            "name" : name,
            "type" : project_type,
            "user_id" : user_id,
            "created_at" : d,
            "updated_at" : d,
            "submission_ids" : []
        }

        dbResponse = db.projects.insert_one(instance)
        print(dbResponse.inserted_id)

        return Response(
            response= json.dumps({"message": "project created"}),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)



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
        data_samples = []
        tests = {}
        for k in data.keys():
            stat = data[k]["stats"]
            tests.append({
                k: {
                    "y_pred_ind" : stat["y_pred_ind"],
                    "y_pred_ind_adv" : stat["y_pred_ind_adv"],
                    "y_pred_val" : stat["y_pred_val"],
                    "y_pred_val_adv" : stat["y_pred_val_adv"],
                    "y_target" : stat["y_target"],
                    "x_sim" : stat["x_sim"],
                    "time" : stat["time"],
                    "accuracy" : stat["accuracy"],
                    "accuracy_adv" : stat["accuracy_adv"],
                    "mean_similarity" : stat["mean_similarity"]
                }
            })

        instance = {
            "data_samples": data_samples,
            "test_stats": tests
        }

        dbResponse= db.submissions.find_one_and_update({"token": submission_token}, {instance})
        print(dbResponse.inserted_id)

        return Response(
            response= json.dumps({data}),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)


@app.route("/projects/<project_id>/submissions", methods=["GET"])
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
        project = db.projects.find_one({"user_id": CURR_USER_ID})

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


############################## AUTH
@app.route("/register", methods=["POST"])
def register():
    try:
        db.users.insert_one({
            "username": request.form["username"],
            "password": bcrypt.hashpw(request.form["password"].encode('utf-8'), bcrypt.gensalt(10))
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
        if not bcrypt.checkpw(request_data["password"].encode('utf8'), user["password"]):
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
            response= json.dumps({f"exception": "{ex}"}),
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
