import json
import logging
import os

import boto3
from botocore.exceptions import ClientError


logger = logging.getLogger()
logger.setLevel(logging.INFO)


dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["EVENTS_TABLE_NAME"]
TABLE = dynamodb.Table(TABLE_NAME)
EDITABLE_FIELDS = {"name", "date", "location", "budget", "status", "notes"}


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
        },
        "body": json.dumps(body),
    }


def handler(event, context):
    try:
        if event.get("httpMethod") == "OPTIONS":
            return _response(200, {})

        event_id = (event.get("pathParameters") or {}).get("id")
        if not isinstance(event_id, str) or not event_id.strip():
            return _response(400, {"error": "A valid event ID is required."})

        body = event.get("body") or "{}"
        try:
            payload = json.loads(body) if isinstance(body, str) else body
        except json.JSONDecodeError:
            return _response(400, {"error": "Request body must be valid JSON."})

        if not isinstance(payload, dict) or not payload:
            return _response(400, {"error": "Request body must contain editable event fields."})

        if {"id", "createdAt"}.intersection(payload):
            return _response(400, {"error": "Event ID and creation time cannot be updated."})
        if set(payload) - EDITABLE_FIELDS:
            return _response(400, {"error": "Request contains unsupported event fields."})
        if "name" in payload and (not isinstance(payload["name"], str) or not payload["name"].strip()):
            return _response(400, {"error": "Event name must be non-empty text."})
        if "date" in payload and (not isinstance(payload["date"], str) or not payload["date"].strip()):
            return _response(400, {"error": "Event date must be non-empty text."})

        expression_names = {f"#{field}": field for field in payload}
        expression_values = {f":{field}": value for field, value in payload.items()}
        update_expression = "SET " + ", ".join(
            f"#{field} = :{field}" for field in payload
        )

        try:
            response = TABLE.update_item(
                Key={"id": event_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_names,
                ExpressionAttributeValues=expression_values,
                ConditionExpression="attribute_exists(id)",
                ReturnValues="ALL_NEW",
            )
        except ClientError as error:
            if error.response.get("Error", {}).get("Code") == "ConditionalCheckFailedException":
                return _response(404, {"error": "Event not found."})
            raise

        return _response(200, response["Attributes"])
    except Exception:
        logger.exception("Unexpected error updating event")
        return _response(500, {"error": "Internal server error"})