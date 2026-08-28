import json
import logging
import os
import uuid
from datetime import datetime, timezone

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

        body = event.get("body") or "{}"
        try:
            payload = json.loads(body) if isinstance(body, str) else body
        except json.JSONDecodeError:
            return _response(400, {"error": "Request body must be valid JSON."})

        if not isinstance(payload, dict):
            return _response(400, {"error": "Request body must be a JSON object."})

        missing = [field for field in ("name", "date") if not payload.get(field)]
        if missing:
            return _response(400, {"error": f"Missing required fields: {', '.join(missing)}"})
        if not isinstance(payload["name"], str) or not payload["name"].strip():
            return _response(400, {"error": "Event name must be non-empty text."})
        if not isinstance(payload["date"], str) or not payload["date"].strip():
            return _response(400, {"error": "Event date must be non-empty text."})

        event_record = {
            "id": str(uuid.uuid4()),
            "name": payload["name"],
            "date": payload["date"],
            "location": payload.get("location") or "",
            "budget": payload.get("budget") or "0",
            "status": payload.get("status") or "Planning",
            "notes": payload.get("notes") or "",
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }

        TABLE.put_item(Item=event_record)
        return _response(201, event_record)
    except Exception:
        logger.exception("Unexpected error creating event")
        return _response(500, {"error": "Internal server error"})