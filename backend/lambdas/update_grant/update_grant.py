import json
import logging
import os
import uuid

import boto3
from botocore.exceptions import ClientError


logger = logging.getLogger()
logger.setLevel(logging.INFO)


dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["GRANTS_TABLE_NAME"]
TABLE = dynamodb.Table(TABLE_NAME)
EDITABLE_FIELDS = {
    "name",
    "organization",
    "amount",
    "deadline",
    "status",
    "owner",
    "notes",
}


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE,PUT",
        },
        "body": json.dumps(body),
    }


def handler(event, context):
    try:
        if event.get("httpMethod") == "OPTIONS":
            return _response(200, {})

        grant_id = (event.get("pathParameters") or {}).get("id")
        if not isinstance(grant_id, str) or not grant_id.strip():
            return _response(400, {"error": "A valid grant ID is required."})

        try:
            uuid.UUID(grant_id)
        except ValueError:
            return _response(400, {"error": "A valid grant ID is required."})

        body = event.get("body") or "{}"
        try:
            payload = json.loads(body) if isinstance(body, str) else body
        except json.JSONDecodeError:
            return _response(400, {"error": "Request body must be valid JSON."})

        if not isinstance(payload, dict) or not payload:
            return _response(400, {"error": "Request body must contain editable grant fields."})

        immutable_fields = {"id", "createdAt"}.intersection(payload)
        if immutable_fields:
            return _response(400, {"error": "Grant ID and creation time cannot be updated."})

        unsupported_fields = set(payload) - EDITABLE_FIELDS
        if unsupported_fields:
            return _response(400, {"error": "Request contains unsupported grant fields."})

        if "name" in payload and not isinstance(payload["name"], str):
            return _response(400, {"error": "Grant name must be text."})
        if "organization" in payload and not isinstance(payload["organization"], str):
            return _response(400, {"error": "Organization must be text."})
        if "name" in payload and not payload["name"].strip():
            return _response(400, {"error": "Grant name cannot be empty."})
        if "organization" in payload and not payload["organization"].strip():
            return _response(400, {"error": "Organization cannot be empty."})

        expression_names = {f"#{field}": field for field in payload}
        expression_values = {f":{field}": value for field, value in payload.items()}
        update_expression = "SET " + ", ".join(
            f"#{field} = :{field}" for field in payload
        )

        try:
            response = TABLE.update_item(
                Key={"id": grant_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_names,
                ExpressionAttributeValues=expression_values,
                ConditionExpression="attribute_exists(id)",
                ReturnValues="ALL_NEW",
            )
        except ClientError as error:
            if error.response.get("Error", {}).get("Code") == "ConditionalCheckFailedException":
                return _response(404, {"error": "Grant not found."})
            raise

        return _response(200, response["Attributes"])
    except Exception:
        logger.exception("Unexpected error updating grant")
        return _response(500, {"error": "Internal server error"})