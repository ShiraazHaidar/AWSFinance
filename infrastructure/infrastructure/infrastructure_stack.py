from pathlib import Path

from aws_cdk import (
    Duration,
    RemovalPolicy,
    Stack,
    CfnOutput,
    aws_apigateway as apigateway,
    aws_cognito as cognito,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    aws_lambda as lambda_,
)
from constructs import Construct


class InfrastructureStack(Stack):

    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        grants_table = dynamodb.Table(
            self,
            "GrantsTable",
            table_name="AWSFinance-Grants",
            partition_key=dynamodb.Attribute(
                name="id",
                type=dynamodb.AttributeType.STRING,
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.RETAIN,
        )

        events_table = dynamodb.Table(
            self,
            "EventsTable",
            table_name="AWSFinance-Events",
            partition_key=dynamodb.Attribute(
                name="id",
                type=dynamodb.AttributeType.STRING,
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.RETAIN,
        )

        user_pool = cognito.UserPool(
            self,
            "FinanceToolUserPool",
            user_pool_name="FinanceTool",
            self_sign_up_enabled=False,
            sign_in_aliases=cognito.SignInAliases(email=True),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True),
            ),
            custom_attributes={},
        )

        user_pool_client = user_pool.add_client(
            "FinanceToolUserPoolClient",
            user_pool_client_name="FinanceToolBrowserClient",
            generate_secret=False,
            auth_flows=cognito.AuthFlow(user_password=True, user_srp=True),
        )

        api = apigateway.RestApi(
            self,
            "GrantTrackingApi",
            rest_api_name="GrantTrackingApi",
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=["http://localhost:5173"],
                allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                allow_headers=["Content-Type", "Authorization"],
            ),
        )

        cognito_authorizer = apigateway.CognitoUserPoolsAuthorizer(
            self,
            "GrantTrackingAuthorizer",
            cognito_user_pools=[user_pool],
            identity_source="method.request.header.Authorization",
        )

        project_root = Path(__file__).resolve().parents[2]

        create_grant_lambda = lambda_.Function(
            self,
            "CreateGrantFunction",
            function_name="CreateGrantFunction",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="create_grant.handler",
            code=lambda_.Code.from_asset(str(project_root / "backend" / "lambdas" / "create_grant")),
            timeout=Duration.seconds(30),
            memory_size=512,
            environment={"GRANTS_TABLE_NAME": grants_table.table_name},
        )

        list_grants_lambda = lambda_.Function(
            self,
            "ListGrantsFunction",
            function_name="ListGrantsFunction",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="list_grants.handler",
            code=lambda_.Code.from_asset(str(project_root / "backend" / "lambdas" / "list_grants")),
            timeout=Duration.seconds(30),
            memory_size=512,
            environment={"GRANTS_TABLE_NAME": grants_table.table_name},
        )

        delete_grant_lambda = lambda_.Function(
            self,
            "DeleteGrantFunction",
            function_name="DeleteGrantFunction",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="delete_grant.handler",
            code=lambda_.Code.from_asset(str(project_root / "backend" / "lambdas" / "delete_grant")),
            timeout=Duration.seconds(30),
            memory_size=512,
            environment={"GRANTS_TABLE_NAME": grants_table.table_name},
        )

        update_grant_lambda = lambda_.Function(
            self,
            "UpdateGrantFunction",
            function_name="UpdateGrantFunction",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="update_grant.handler",
            code=lambda_.Code.from_asset(str(project_root / "backend" / "lambdas" / "update_grant")),
            timeout=Duration.seconds(30),
            memory_size=512,
            environment={"GRANTS_TABLE_NAME": grants_table.table_name},
        )

        create_event_lambda = lambda_.Function(
            self,
            "CreateEventFunction",
            function_name="CreateEventFunction",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="create_event.handler",
            code=lambda_.Code.from_asset(str(project_root / "backend" / "lambdas" / "create_event")),
            timeout=Duration.seconds(30),
            memory_size=512,
            environment={"EVENTS_TABLE_NAME": events_table.table_name},
        )

        list_events_lambda = lambda_.Function(
            self,
            "ListEventsFunction",
            function_name="ListEventsFunction",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="list_events.handler",
            code=lambda_.Code.from_asset(str(project_root / "backend" / "lambdas" / "list_events")),
            timeout=Duration.seconds(30),
            memory_size=512,
            environment={"EVENTS_TABLE_NAME": events_table.table_name},
        )

        create_grant_lambda.add_to_role_policy(
            iam.PolicyStatement(
                actions=["dynamodb:PutItem"],
                resources=[grants_table.table_arn],
            )
        )
        list_grants_lambda.add_to_role_policy(
            iam.PolicyStatement(
                actions=["dynamodb:Scan"],
                resources=[grants_table.table_arn],
            )
        )
        delete_grant_lambda.add_to_role_policy(
            iam.PolicyStatement(
                actions=["dynamodb:DeleteItem"],
                resources=[grants_table.table_arn],
            )
        )
        update_grant_lambda.add_to_role_policy(
            iam.PolicyStatement(
                actions=["dynamodb:UpdateItem"],
                resources=[grants_table.table_arn],
            )
        )
        create_event_lambda.add_to_role_policy(
            iam.PolicyStatement(
                actions=["dynamodb:PutItem"],
                resources=[events_table.table_arn],
            )
        )
        list_events_lambda.add_to_role_policy(
            iam.PolicyStatement(
                actions=["dynamodb:Scan"],
                resources=[events_table.table_arn],
            )
        )

        grants_resource = api.root.add_resource("grants")
        grants_resource.add_method(
            "POST",
            apigateway.LambdaIntegration(create_grant_lambda),
            authorization_type=apigateway.AuthorizationType.COGNITO,
            authorizer=cognito_authorizer,
        )

        events_resource = api.root.add_resource("events")
        events_resource.add_method(
            "POST",
            apigateway.LambdaIntegration(create_event_lambda),
            authorization_type=apigateway.AuthorizationType.COGNITO,
            authorizer=cognito_authorizer,
        )
        events_resource.add_method(
            "GET",
            apigateway.LambdaIntegration(list_events_lambda),
            authorization_type=apigateway.AuthorizationType.COGNITO,
            authorizer=cognito_authorizer,
        )

        grant_resource = grants_resource.add_resource("{id}")
        grant_resource.add_method(
            "DELETE",
            apigateway.LambdaIntegration(delete_grant_lambda),
            authorization_type=apigateway.AuthorizationType.COGNITO,
            authorizer=cognito_authorizer,
        )
        grant_resource.add_method(
            "PUT",
            apigateway.LambdaIntegration(update_grant_lambda),
            authorization_type=apigateway.AuthorizationType.COGNITO,
            authorizer=cognito_authorizer,
        )
        grants_resource.add_method(
            "GET",
            apigateway.LambdaIntegration(list_grants_lambda),
            authorization_type=apigateway.AuthorizationType.COGNITO,
            authorizer=cognito_authorizer,
        )

        CfnOutput(self, "GrantApiBaseUrl", value=api.url)
        CfnOutput(self, "FinanceToolUserPoolId", value=user_pool.user_pool_id)
        CfnOutput(self, "FinanceToolUserPoolClientId", value=user_pool_client.user_pool_client_id)