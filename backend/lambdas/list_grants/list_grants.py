import json
import logging
import os

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
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
        },
        "body": json.dumps(body),
    }


def handler(event, context):
    try:
        if event.get("httpMethod") == "OPTIONS":
            return _response(200, [])

        response = TABLE.scan()
        items = response.get("Items", [])
        return _response(200, items)
    except Exception:
        logger.exception("Unexpected error listing grants")
        return _response(500, {"error": "Internal server error"})
