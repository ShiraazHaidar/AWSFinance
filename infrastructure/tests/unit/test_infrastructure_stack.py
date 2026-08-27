import aws_cdk as core
import aws_cdk.assertions as assertions

from infrastructure.infrastructure_stack import InfrastructureStack


def test_grants_api_and_lambda_resources_created():
    app = core.App()
    stack = InfrastructureStack(app, "infrastructure")
    template = assertions.Template.from_stack(stack)

    template.resource_count_is("AWS::Lambda::Function", 2)
    template.has_resource_properties(
        "AWS::Lambda::Function",
        {
            "Handler": "create_grant.handler",
            "Runtime": "python3.12",
        },
    )
    template.has_resource_properties(
        "AWS::Lambda::Function",
        {
            "Handler": "list_grants.handler",
            "Runtime": "python3.12",
        },
    )
    template.has_resource_properties(
        "AWS::ApiGateway::RestApi",
        {
            "Name": "GrantTrackingApi",
        },
    )
    template.has_resource_properties(
        "AWS::Cognito::UserPool",
        {
            "UserPoolName": "FinanceTool",
        },
    )
    template.has_resource_properties(
        "AWS::Cognito::UserPoolClient",
        {
            "GenerateSecret": False,
        },
    )
    template.has_resource_properties(
        "AWS::ApiGateway::Authorizer",
        {
            "Type": "COGNITO_USER_POOLS",
        },
    )
