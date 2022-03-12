### Projects
- GET `/projects`
:fetches all projects for the current user

- GET `/projects/<project_id>`
:fetches specific project by id. Should return with these fields depending :
```JSON
{
    "name": "My Project",
    "type": 1,
    "source_code": "ZnJvbSBEZWVwUGVuQWxnb3JpdGhtIGltcG9ydCBEZWVwUGVuQWxnb3JpdGht\nCmZyb20gY2xldmVyaGFucy50b3JjaC5hdHRhY2tzLmZhc3RfZ3JhZGllbnRf\nbWV0aG9kIGltcG9ydCBmYXN0X2dyYWRpZW50X21ldGhvZAppbXBvcnQgbnVt\ncHkgYXMgbnAKZnJvbSB0b3JjaCBpbXBvcnQgVGVuc29yCgpjbGFzcyBTb2x1\ndGlvbihEZWVwUGVuQWxnb3JpdGhtKToKICAgIGRlZiBydW5fYWxnb3JpdGht\nKHNlbGYsIG5ldCwgZGF0YSkgLT4gVGVuc29yOgogICAgICAgIGVwcyA9IDAu\nMQogICAgICAgIHhfZmdtID0gZmFzdF9ncmFkaWVudF9tZXRob2QobmV0LCBk\nYXRhLCBlcHMsIG5wLmluZikKICAgICAgICByZXR1cm4geF9mZ20K\n",
    "language_id": 420,
    "stdin": "eyJubl9jb25maWdzIjoiW1tcIk1OSVNUX0ZGTk5cIiwyLDEyOF0sW1wiTU5J\nU1RfRkZOTlwiLDMsMjU2XSxbXCJNTklTVF9GRk5OXCIsNCw1MTJdLFtcIk1O\nSVNUX0ZGTk5cIiw1LDEwMjRdXSIsImRhdGFfY29uZmlncyI6IlwiMTAwXCIi\nfQ==\n",
    "compiler_options": ,
    "command_line_arguments": "",
    "redirect_stderr_to_stdout": ""
}
```

- POST `/projects`
: The body MUST include the following fieldS: `name, type, source_code, language_id, stdin, compiler_options, command_line_arguments, redirect_stderr_to_stdout`. If the `project_id` is not passed in the body of the request, it will create a new project. Otherwise, it will save or update the existing project.  To make a project the default project for a given user, just send the POST request with the body as follows: `{ "project_id": project_id, "make_default": true }`

### Submissions
- GET `/projects/<project_id>/submissions/<submission_token>`
: fetches the results of a submission with the given submission token. It will return the stats about the tests:
```JSON
{
    "project_id" : "project_id",
    "token": "token",
    "params": {
        "source_code": "ZnJvbSBEZWVwUGVuQWxnb3JpdGhtIGltcG9ydCBEZWVwUGVuQWxnb3JpdGht\nCmZyb20gY2xldmVyaGFucy50b3JjaC5hdHRhY2tzLmZhc3RfZ3JhZGllbnRf\nbWV0aG9kIGltcG9ydCBmYXN0X2dyYWRpZW50X21ldGhvZAppbXBvcnQgbnVt\ncHkgYXMgbnAKZnJvbSB0b3JjaCBpbXBvcnQgVGVuc29yCgpjbGFzcyBTb2x1\ndGlvbihEZWVwUGVuQWxnb3JpdGhtKToKICAgIGRlZiBydW5fYWxnb3JpdGht\nKHNlbGYsIG5ldCwgZGF0YSkgLT4gVGVuc29yOgogICAgICAgIGVwcyA9IDAu\nMQogICAgICAgIHhfZmdtID0gZmFzdF9ncmFkaWVudF9tZXRob2QobmV0LCBk\nYXRhLCBlcHMsIG5wLmluZikKICAgICAgICByZXR1cm4geF9mZ20K\n",
        "language_id": 420,
        "stdin": "eyJubl9jb25maWdzIjoiW1tcIk1OSVNUX0ZGTk5cIiwyLDEyOF0sW1wiTU5J\nU1RfRkZOTlwiLDMsMjU2XSxbXCJNTklTVF9GRk5OXCIsNCw1MTJdLFtcIk1O\nSVNUX0ZGTk5cIiw1LDEwMjRdXSIsImRhdGFfY29uZmlncyI6IlwiMTAwXCIi\nfQ==\n",
        "compiler_options": "",
        "command_line_arguments": "",
        "redirect_stderr_to_stdout": true
    },
    "data_samples": {
        "indicies": [],
        "y": "",
        "x": ""
    },
    "test_stats": {
        "test_name1": {
            "adv": "x_adv",
            "results": {
                "y_pred_ind": "",
                "y_pred_ind_adv": "",
                "y_pred_val": "",
                "y_pred_val_adv": "",
                "x_sim": "",
            },
            "stats": {
                "time": "",
                "accuracy": "",
                "accuracy_adv": "",
                "mean_similarity": ""
            }
        },
        "test_name2": {
            "adv": "x_adv",
            "results": {
                "y_pred_ind": "",
                "y_pred_ind_adv": "",
                "y_pred_val": "",
                "y_pred_val_adv": "",
                "x_sim": "",
            },
            "stats": {
                "time": "",
                "accuracy": "",
                "accuracy_adv": "",
                "mean_similarity": ""
            }
        }
    }
}
```


- POST `/projects/<project_id>/submissions`
: request to start an evaluation. The body must contain the fields: `source_code, language_id, stdin, compiler_options, command_line_arguments, redirect_stderr_to_stdout`.
