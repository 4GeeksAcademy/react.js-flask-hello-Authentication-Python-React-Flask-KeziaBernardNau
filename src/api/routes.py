"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
import hashlib
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required

api = Blueprint('api', __name__)


# Allow CORS requests to this API
CORS(api)


@api.route("/Token", methods=["POST"])
def create_token():
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    if email != "test" or password != "test":
        return jsonify({"msg": "Bad email or password"}), 401

    access_token = create_access_token(identity=email)
    return jsonify(access_token=access_token)


@api.route('/signup', methods=['POST'])
def handle_create_user():
    # this line is getting the json info sent over from the post request
    body = request.get_json(force = True)
    email = body['email']
    # hashing the password for security reasons
    # hashlib is a built in python functionality
    password = hashlib.sha256(body['password'].encode("utf-8")).hexdigest()
    # creating a user and adding it User model
    new_user = User(email = email, password = password, is_active = True)
    db.session.add(new_user)
    db.session.commit()
    # creates an access token based on the user
    access_token = create_access_token(identity = email)
    return jsonify(email, "user successfully created"), 200

@api.route("/User", methods=["GET"])
def get_all_users():
    user= User.query.all()
    all_users= list(map(lambda x: x.serialize(), user))
    return jsonify(all_users), 200


@api.route("/User/<int:id>", methods=["GET"])
def get_user(id):
    user= User.query.get(id)
    if user is None:
        raise APIException('User not found', status_code= 404)
    return jsonify(user.serialize()), 200


@api.route("/User/<int:id>", methods=["PUT"])
def update_user(id):
    user= User.query.get(id)
    body= request.get_json
    if user is None:
        raise APIException('User not found', status_code= 404)
    if  "email" in body:
        user.email=body["email"]
    if  "password" in body:
        user.password=body["password"]
    if  "is_active" in body:
        user.is_active=body["is_active"]
    db.session.commit()
    return jsonify(user.serialize()), 200


@api.route("/User/<int:id>", methods=["DELETE"])
def delete_user(id):
    user= User.query.get(id)
    if user is None:
        raise APIException('User not found', status_code= 404)
    db.session.delete(user)
    db.session.commit()
    return jsonify(user.serialize()), 200


@api.route("/private", methods=["GET"])
@jwt_required()
def get_private():
    return jsonify({"msg":"This is a private end point, you need to be logged in to see it."}), 200