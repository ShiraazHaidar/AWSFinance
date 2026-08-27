import json
import logging
import os
import uuid
from datetime import datetime, timezone

import boto3


logger = logging.getLogger()
logger.setLevel(logging.INFO)


dynamodb = boto3.resource("dynamodb")
TABLE_NAME = os.environ["GRANTS_TABLE_NAME"]
TABLE = dynamodb.Table(TABLE_NAME)


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        "body": json.dumps(body),
    }


def handler(event, context):
    try:
        if event.get("httpMethod") == "OPTIONS":
            return _response(200, {})

        body = event.get("body") or "{}"
        if isinstance(body, str):
            payload = json.loads(body)
        else:
            payload = body

        required_fields = ["name", "organization"]
        missing = [field for field in required_fields if not payload.get(field)]
        if missing:
            return _response(400, {"error": f"Missing required fields: {', '.join(missing)}"})

        grant = {
            "id": str(uuid.uuid4()),
            "name": payload.get("name"),
            "organization": payload.get("organization"),
            "amount": payload.get("amount") or "0",
            "deadline": payload.get("deadline"),
            "status": payload.get("status") or "Researching",
            "owner": payload.get("owner") or "",
            "notes": payload.get("notes") or "",
            "createdAt": datetime.now(timezone.utc).isoformat(),
        }

        TABLE.put_item(Item=grant)
        return _response(201, grant)
    except Exception:
        logger.exception("Unexpected error creating grant")
        return _response(500, {"error": "Internal server error"})
