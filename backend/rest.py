from cgitb import reset
from cmath import e
from distutils.log import debug
from email import header
from flask import Flask, Response, request
from flask_cors import CORS, cross_origin
import pymongo
import json
from types import SimpleNamespace
from bson.objectid import ObjectId
from bson.json_util import dumps
import requests
from flask_bcrypt import Bcrypt,generate_password_hash, check_password_hash
import bcrypt
import datetime
import jwt
import base64
import os

from enum import Enum

class ProjectType(int, Enum):
    PY_TORCH = 1
    TENSORFLOW = 2


app = Flask(__name__)
CORS(app, support_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'
app.secret_key = 'HERE_IS_A_KEY'

sandboxUrl = str("http://sandbox") + ":" + str(2358)
wait = False

try:
    mongo = pymongo.MongoClient(
        host = [ str("mongodb") + ":" + str(27017) ],
        serverSelectionTimeoutMS = 3000, # 3 second timeout
        username = "root",
        password = "DeepPenetration",
    )
    db = mongo.db
    print("Successfully connected to db")
except:
    print("ERROR - Cannot connect to db")


def auth(request):
    request_token = str(request.headers['Authorization'])
    stored_token = db.tokens.find_one({"token" : request_token, "valid": True})

    if stored_token:
        return stored_token
    else:
        return True


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
    if request.method == "OPTIONS":
        return Response(status=200)
    if request.endpoint != "login" and request.endpoint != "register" and request.endpoint != "logout":
        if not auth(request):
            return Response(
                status=401
            )

################################# DASHBOARDS #################################

@app.route("/dashboards", methods=["POST"])
@cross_origin()
def save_dashboard():
    try:
        body = request.get_json()
        user_id = jwt.decode(request.headers["authorization"], "DeepPenetration", algorithms=["HS256"])["sub"]

        d = datetime.datetime.utcnow()

        instance = {
            **body,
            "created_at": d,
            "updated_at": d,
            "user_id": user_id
        }

        dbResponse = db.dashboards.insert_one(instance)

        return Response(
            response= "Successfully added dashboard",
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        return Response(
            response= json.dumps({"message": "Unable to store dashboard", "ex": str(ex)}),
            status= 500,
            mimetype="application/json",
        )

@app.route("/dashboards", methods=["GET"])
@cross_origin()
def get_dashboards():
    try:
        dbResponse = db.dashboards.find({"user_id": jwt.decode(request.headers["authorization"], "DeepPenetration", algorithms=["HS256"])["sub"]})

        return Response(
            response= dumps(dbResponse),
            status= 200,
            mimetype="application/json",
        )

    except Exception as ex:
        return Response(
            response= json.dumps({"message": "Unable to find dashboard", "ex": str(ex)}),
            status= 500,
            mimetype="application/json",
        )


@app.route("/dashboards/<dashboard_id>", methods=["GET"])
@cross_origin()
def get_dashboard(dashboard_id):
    try:
        dbResponse = db.dashboards.find_one({"_id": ObjectId(dashboard_id)})

        return Response(
            response= dumps(dbResponse),
            status= 200,
            mimetype="application/json",
        )

    except Exception as ex:
        return Response(
            response= json.dumps({"message": "Unable to find dashboard", "ex": str(ex)}),
            status= 500,
            mimetype="application/json",
        )


@app.route("/dashboards/<dashboard_id>", methods=["DELETE"])
@cross_origin()
def delete_by_dashboard_id(dashboard_id):
    try:
        db.dashboards.delete_one({"_id": ObjectId(dashboard_id)})

        return Response(
            response= "Resource Deleted Succesfully",
            status= 204,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": "Unable to delete dashboard", "ex": str(ex)}),
            status= 500,
            mimetype="application/json",
        )


################################# PROJECTS #################################
@app.route("/projects", methods=["GET"])
@cross_origin()
def get_all_projects():
    try:
        projects = db.projects.find({"user_id": jwt.decode(request.headers["authorization"], "DeepPenetration", algorithms=["HS256"])["sub"]})

        return Response(
            response= dumps(projects),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": "Unable to get all projects", "ex": str(ex)}),
            status= 500,
            mimetype="application/json",
        )


@app.route("/projects/<project_id>", methods=["DELETE"])
@cross_origin()
def delete_by_project_id(project_id):
    try:
        app.logger.info(f"delete: {project_id}")
        db.projects.delete_one({"_id": ObjectId(project_id)})

        return Response(
            response= "Resource Deleted Succesfully",
            status= 204,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": "Unable to delete project", "ex": str(ex)}),
            status= 500,
            mimetype="application/json",
        )


@app.route("/projects/<project_id>", methods=["GET"])
@cross_origin()
def get_project_by_id(project_id):
    try:
        project = db.projects.find_one({"_id": ObjectId(project_id)})

        latest_submission_id = project["submission_ids"][-1]
        submission = db.submissions.find_one({"_id": latest_submission_id})

        # try:
        #     submission = db.submissions.find({"project_id": project_id}).sort("_id",-1)[0]
        # except:
        #     submission = db.submissions.find({"project_id": ObjectId(project_id)}).sort("_id",-1)[0]

        resp = {'project': project, 'submission': submission}

        return Response(
            response= dumps(resp),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": f"Unable to get project {project_id}", "ex": str(ex)}),
            status= 500,
            mimetype="application/json",
        )

@app.route("/projects_stats/<project_id>", methods=["GET"])
@cross_origin()
def get_project_stats_by_id(project_id):
    try:
        project = db.projects.find_one({"_id": ObjectId(project_id)})
<<<<<<< HEAD

        latest_submission_id = project["submission_ids"][-1]
        submission = db.submissions.find_one({"_id": latest_submission_id})
=======
        
        latest_submission_id = project["submission_ids"][-1]
        submission = db.submissions.find_one({"_id": latest_submission_id})

>>>>>>> origin/manish_new
        # try:
        #     submission = db.submissions.find({"project_id": project_id}).sort("_id",-1)[0]
        # except:
        #     submission = db.submissions.find({"project_id": ObjectId(project_id)}).sort("_id",-1)[0]

        resp = {'project': project, 'stats': submission["stats"]}

        return Response(
            response= dumps(resp),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": f"Unable to get project {project_id}", "ex": str(ex)}),
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
    db.projects.update_one({"_id": dbResponse.inserted_id}, {"$set": {"project_id": str(dbResponse.inserted_id)}})
    return dbResponse.inserted_id



@app.route("/projects", methods=["POST"])
@cross_origin()
def save_project():
    try:
        body = request.get_json()

        # project_id is not given
        # creates new project
        if "project_id" not in body:
            body["user_id"] = jwt.decode(request.headers["authorization"], "DeepPenetration", algorithms=["HS256"])["sub"]
            project_id = create_project(body)
            return Response(
                response= json.dumps({"message": "created and saved project", "project_id": str(project_id)}),
                status= 200,
                mimetype="application/json",
            )

        else:
            project_id = body["project_id"]
            body["user_id"] = jwt.decode(request.headers["authorization"], "DeepPenetration", algorithms=["HS256"])

            project = db.projects.find_one({"_id": project_id})

            if (project == None):
                project_id = create_project(body)

            # if (body["make_default"] == True):
            #     dbResponse = db.projects.update_one({"user_id": jwt.decode(request.headers["authorization"], "DeepPenetration", algorithms=["HS256"])}, {"default_project": project_id})

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
            response= json.dumps({"message": f"Unable to update project {project_id}", "ex": str(ex)}),
            status= 500,
            mimetype="application/json",
        )

################################# SUBMISSIONS
@app.route("/submissions/<submission_token>", methods=["GET"])
@cross_origin(supports_credentials=True)
def get_submission(submission_token):
    try:
        url = sandboxUrl + f"/submissions/{submission_token}/?base64_encoded=true"
        submission = requests.get(url)

        # find submission and save the test results
        data = submission.json()
        output = data['compile_output']
        if output:
            output=base64.b64decode(output)
            output =json.loads(output)
            output=output['results']
            stats={}
            for i in output.items():
                stats[i[0]] ={"stats":i[1]["stats"]}
            data["stats"]=stats

        newvalue = {"$set": data}
        dbResponse = db.submissions.update_one({"token": submission_token}, newvalue)

        # if (dbResponse.matchedCount <= 0 and dbResponse.modifiedCount <= 0):
        #         return Response(
        #             response= json.dumps({"message": f"Unable to save results for submission {submission_token}"}),
        #             status= 500,
        #             mimetype="application/json",
        #         )

        submission = db.submissions.find_one({"token": submission_token})

        return Response(
            response= dumps(submission),
            status= 200,
            mimetype="application/json",
        )

    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": f"Unable to fetch submission {submission_token}", "ex": str(ex)}),
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
            response= json.dumps({"message": f"Unable to fetch submissions for project {project_id}", "ex": str(ex)}),
            status= 500,
            mimetype="application/json",
        )

@app.route("/projects/submissions", methods=["POST"])
@cross_origin(supports_credentials=True)
def handle_submission_no_project_id():
    try:
        args = request.args
        body = request.get_json()

        #create a project before we submit
        body["user_id"] = jwt.decode(request.headers["authorization"], "DeepPenetration", algorithms=["HS256"])["sub"]
        project_id = create_project(body)

        url = sandboxUrl + f"/submissions?base64_encoded=true&wait=true"
        session = requests.Session()
        session.trust_env = False
        submission = session.post(url, json=body)

        res = submission.json()
        token = res["token"]

        filename = str(project_id) + "@additional_files.txt"
        # file passed in save to local
        if "additional_files" in body:
            filepath = "./additional_files/" + filename

            with open(filepath, "w") as f:
                f.write(body["additional_files"])
            # remove additional files from body
            # we want to save filename in mongodb
            body["additional_files"] = filename

        instance = {
            "project_id" : project_id,
            "token": token,
            "params": body,
        }

        dbResponse= db.submissions.insert_one(instance)

        # Find project and save the submission id
        project = db.projects.find_one({"_id": ObjectId(project_id)})

        if (project == None):
            return Response(
                response= json.dumps({"message": f"Unable to find project {project_id}"}),
                status= 500,
                mimetype="application/json",
            )

        updated_submission_ids = project["submission_ids"].copy()
        updated_submission_ids.append(dbResponse.inserted_id)

        app.logger.info(f"inserteddd: {updated_submission_ids}")

        d = datetime.datetime.utcnow()
        newvalues = { "$set": { "submission_ids": updated_submission_ids, "updated_at": d, "additional_files":  filename}}

        dbResponse = db.projects.update_one({"_id" : ObjectId(project["_id"])}, newvalues)

        return Response(
            response= json.dumps({"token" : token}),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": "Unable to submit submission", "ex": str(ex)}),
            status= 500,
            mimetype="application/json",
        )


@app.route("/projects/<project_id>/submissions", methods=["POST"])
@cross_origin(supports_credentials=True)
def handle_submission(project_id):
    try:
        args = request.args
        body = request.get_json()

        # Find project
        project = db.projects.find_one({"_id": ObjectId(project_id)})

        if (project == None):
            return Response(
                response= json.dumps({"message": f"Unable to find project {project_id}"}),
                status= 500,
                mimetype="application/json",
            )

        passed_as_filename = False
        filename = project_id + "@additional_files.txt"
        # handle additional files
        if "additional_files" in body:
            filepath = "./additional_files/" + filename

            # filename passed in as param
            if (len(filename) == len(body["additional_files"])):
                passed_as_filename = True
                if os.path.exists(filepath):
                    with open(filepath, "r") as f:
                        body["additional_files"] = f.read()

        url = sandboxUrl + f"/submissions?base64_encoded=true&wait={args['wait']}"
        submission = requests.post(url, data=body)
        res = submission.json()
        token = res["token"]

        # save additional files to local
        if "additional_files" in body:
            if not passed_as_filename:
                with open("/additional_files/" + filename, "w") as f:
                    f.write(body["additional_files"])

            # remove additional files from body
            # we want to save th filename in mongodb
            body["additional_files"] = filename

        instance = {
            "project_id" : project_id,
            "token": token,
            "params": body,
        }

        dbResponse= db.submissions.insert_one(instance)

        updated_submission_ids = project["submission_ids"].copy()
        updated_submission_ids.append(dbResponse.inserted_id)
        d = datetime.datetime.utcnow()

        newvalues = { "$set": { "submission_ids": updated_submission_ids, "updated_at": d, "additional_files": filename }}

        dbResponse = db.projects.update_one({"_id" : ObjectId(project["_id"])}, newvalues)

        return Response(
            response= json.dumps({"token" : token}),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

        return Response(
            response= json.dumps({"message": "Unable to submit submission", "ex": str(ex)}),
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
        request_data = request.get_json()
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

        return Response(
            response= json.dumps({
                "user": json.dumps(user),
                "token": user_token
            }),
            status=200
        )
    except Exception as ex:
        app.logger.info(ex)
        return Response(
            response= json.dumps({"exception": f"{str(ex)}"}),
            status=500
        )

@app.route("/logout", methods=["POST"])
def logout():
    try:
        user_id = jwt.decode(request.headers["authorization"], "DeepPenetration", algorithms=["HS256"])["sub"]
        user = db.users.find_one({"_id": ObjectId(user_id)})

        db.tokens.update_many({"user" : user["_id"]}, {"$set": {"valid": False}})

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
        app.logger.info("get user route")
        app.logger.info(request.headers["authorization"])
        user = db.users.find_one({"_id": ObjectId(id)})
        del user["password"]
        app.logger.info(user)
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
    response.headers["Access-Control-Allow-Methods"] = "GET,HEAD,OPTIONS,POST,PUT,DELETE "
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, authorization"

    return response

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6969, debug=True)
