import os
from flask import Flask, request
from .models import User

app = Flask(__name__)

@app.post("/import")
def import_user():
    # Mass assignment (CWE-915): the whole request splatted into the model.
    return User(**request.json)

@app.post("/backup")
def backup():
    # Command injection (CWE-78): request input reaches os.system.
    name = request.args.get("name")
    os.system("tar czf /backups/" + name + ".tgz /data")
    return "ok"
