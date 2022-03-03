from cgitb import reset
from flask import Flask, Response, request
from flask_cors import CORS, cross_origin
import pymongo
import json
from types import SimpleNamespace
from bson.objectid import ObjectId
from flask_bcrypt import Bcrypt,generate_password_hash, check_password_hash
import bcrypt
import datetime
import jwt


app = Flask(__name__)
CORS(app, support_credentials=True)
app.config['CORS_HEADERS'] = 'Content-Type'

sandboxUrl = "http://127.0.0.1:2358"
wait = False

try:
    mongo = pymongo.MongoClient(
        "mongodb+srv://martin:DeepPen@cluster0.ldso5.mongodb.net/DeepPen?retryWrites=true&w=majority"
    )
    db = mongo.db
    mongo.server_info()

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
    

#################################GET METHOD
@app.route("/test", methods=["GET"])
def get_some_test():
    try:
        data = list(db.test.find())

        for user in data:
            user["_id"]= str(user["_id"])
        return Response(
            response= json.dumps(data),
            status=200,
            mimetype="application/json"
        )
    except Exception as ex:
        print(ex)
        return Response(
            response= json.dumps({
                "message": "cannot read users"
            }),
            status= 500,
            mimetype="application/json"
        )

@app.route("/submissions/<submission_token>", methods=["GET"])
@cross_origin(supports_credentials=True)
def get_submission(submission_token):
    try:
        url = sandboxUrl + f"/submissions/{submission_token}/?base64_encoded=true"
        submission = requests.get(url)

        res = submission.json()
        print(res)

        # save the submission data into the database


        # data = request.get_json(force=True)
        # tests = []
        # for k in data.keys():
        #     stat = data[k]["stats"]
        #     tests.append({
        #         "y_pred_ind" : stat["y_pred_ind"],
        #         "y_pred_ind_adv" : stat["y_pred_ind_adv"],
        #         "y_pred_val" : stat["y_pred_val"],
        #         "y_pred_val_adv" : stat["y_pred_val_adv"],
        #         "y_target" : stat["y_target"],
        #         "x_sim" : stat["x_sim"],
        #         "time" : stat["time"],
        #         "accuracy" : stat["accuracy"],
        #         "accuracy_adv" : stat["accuracy_adv"],
        #         "mean_similarity" : stat["mean_similarity"]
        #     })
        # instance = {
        #     "user_id": data["user_id"],
        #     "tests": tests,
        # }

        # dbResponse= db.test_results.insert_one(instance)
        # print(dbResponse.inserted_id)


        return Response(
            response= json.dumps({res}),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)


################################# POST METHOD
@app.route("/test", methods=["POST"])
def create_test():
    try:
        instance= {
            "name":request.form["name"],
            "lastName": request.form["lastName"]
            }
        dbResponse= db.test.insert_one(instance)
        print(dbResponse.inserted_id)
        return Response(
            response= json.dumps({
                "message":"user created",
                "id": f"{dbResponse.inserted_id}"
            }),
            status= 200,
            mimetype="application/json"
        )
    except Exception as ex:
        print("********")
        print(ex)

@app.route("/submissions", methods=["POST"])
@cross_origin(supports_credentials=True)
def handle_submission():
    try:
        args = request.args
        body = request.get_json()

        url = sandboxUrl + f"/submissions?base64_encoded=true&wait={args['wait']}"
        submission = requests.post(url, data=body)

        res = submission.json()
        token = res["token"]
        return Response(
            response= json.dumps({"token" : token}),
            status= 200,
            mimetype="application/json",
        )
    except Exception as ex:
        print("********")
        print(ex)

##############################PATCH METHOD
@app.route("/test/<id>", methods=["PATCH"])
def update_test(id):
    try:
        dbResponse= db.test.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"name": request.form["name"]}},
            # {"$set": {"lastName": request.form["lastName"]}}
        )
        ##this can only update the name entry only, ADD THE REST OF THE ENTRIES

        if dbResponse.modified_count==1:

            return Response(
                response= json.dumps(
                    {"message": "user updated"}
                ),
                status=200,
                mimetype="application/json"
            )

        return Response(
            response= json.dumps(
                {"message": "nothing to update"}
            ),
            status=200,
            mimetype="application/json"
        )

    except Exception as ex:
        print(ex)
        return Response(
            response= json.dumps({
                "message": "sorry cannot update user"
            }),
            status= 500,
            mimetype="application/json"
        )

############################# DELETE METHOD
@app.route("/test/<id>", methods=["DELETE"])
def delete_user(id):
    try:
        dbResponse= db.test.delete_one(
            {"_id": ObjectId(id)}
        )
        if dbResponse.deleted_count==1:

            return Response(
                response= json.dumps(
                    {"message": "user deleted", "id": f"{id}"}
                ),
                status=200,
                mimetype="application/json"
            )
        return Response(
            response= json.dumps(
                {"message": "user not found", "id": f"{id}"}
            ),
            status=200,
            mimetype="application/json"
        )


    except Exception as ex:
        print(ex)
        return Response(
            response= json.dumps({
                "message": "sorry cannot delete user"
            }),
            status= 500,
            mimetype="application/json"
        )

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

        return Response(
            response= json.dumps({
                "user": json.dumps(user),
                "token": user_token
            }),
            status=200
        )
    except Exception as ex:
        return Response(
            response= json.dumps({"exception": "error"}),
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
    app.run(port=6969, debug=True)
