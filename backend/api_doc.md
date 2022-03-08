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
    "stdout": "",
    "stderr": "",
    "compile_output": "",
    "message": "",
    "time": "",
    "memory": "",
    "status": "",
    "compiler_options": ,
    "command_line_arguments": ""
}
```

- POST `/projects/create_new`
: creates a new project for the user. Nothing needs to be passed in the body of the request. Will return the project_id of the new project

- POST `/projects/<project_id>`
: saves or updates the existing project. The body can include any of the following field: `name, type, source_code, language_id, stdin, stdout, stderr, compile_output, message, time, memory, status, compiler_options, command_line_arguments`. To make a project the default project for a given user, just send the POST request with the body as follows: `{ "make_default": true }`

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
        "stdin": "eyJubl9jb25maWdzIjoiW1tcIk1OSVNUX0ZGTk5cIiwyLDEyOF0sW1wiTU5J\nU1RfRkZOTlwiLDMsMjU2XSxbXCJNTklTVF9GRk5OXCIsNCw1MTJdLFtcIk1O\nSVNUX0ZGTk5cIiw1LDEwMjRdXSIsImRhdGFfY29uZmlncyI6IlwiMTAwXCIi\nfQ==\n"
        "status_id": 1,
        "created_at": "2022-03-03 22:17:53.632640",
        "token": "cbaac99e-d392-4226-928a-e76b42c6ea90",
        "number_of_runs": 1,
        "cpu_time_limit": "600.0",
        "cpu_extra_time": "1.0",
        "wall_time_limit": "900.0",
        "memory_limit": 1000000,
        "stack_limit": 64000,
        "max_processes_and_or_threads": 60,
        "enable_per_process_and_thread_time_limit": false,
        "enable_per_process_and_thread_memory_limit": false,
        "max_file_size": 1000000,
        "compiler_options": "",
        "command_line_arguments": "","redirect_stderr_to_stdout": true,
        "enable_network": false
    },
    "data_samples": [],
    "test_stats": {
        "test_name1": {
            "y_pred_ind": "",
            "y_pred_ind_adv": "",
            "y_pred_val": "",
            "y_pred_val_adv": "",
            "y_target": "",
            "x_sim": "",
            "time": "",
            "accuracy": "",
            "accuracy_adv": "",
            "mean_similarity": ""
        },
        "test_name2": {
            "y_pred_ind": "",
            "y_pred_ind_adv": "",
            "y_pred_val": "",
            "y_pred_val_adv": "",
            "y_target": "",
            "x_sim": "",
            "time": "",
            "accuracy": "",
            "accuracy_adv": "",
            "mean_similarity": ""
        }
    }
}
```


- POST `/projects/<project_id>/submissions`
: request to start an evaluation. The body must contain the fields: `source_code, language_id, stdin, compiler_options, command_line_arguments, redirect_stderr_to_stdout`.
