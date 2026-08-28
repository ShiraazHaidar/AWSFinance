import json
import logging
import os

import boto3


logger = logging.getLogger()
logger.setLevel(logging.INFO)


dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["EVENTS_TABLE_NAME"]
TABLE = dynamodb.Table(TABLE_NAME)


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

        response = TABLE.delete_item(
            Key={"id": event_id},
            ReturnValues="ALL_OLD",
        )
        if "Attributes" not in response:
            return _response(404, {"error": "Event not found."})

        return _response(204, {})
    except Exception:
        logger.exception("Unexpected error deleting event")
        return _response(500, {"error": "Internal server error"})