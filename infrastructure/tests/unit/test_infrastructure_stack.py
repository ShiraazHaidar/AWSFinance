import aws_cdk as core
import aws_cdk.assertions as assertions

from infrastructure.infrastructure_stack import InfrastructureStack


def test_grants_api_and_lambda_resources_created():
    app = core.App()
    stack = InfrastructureStack(app, "infrastructure")
    template = assertions.Template.from_stack(stack)

    template.resource_count_is("AWS::Lambda::Function", 4)
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
        "AWS::Lambda::Function",
        {
            "FunctionName": "DeleteGrantFunction",
            "Handler": "delete_grant.handler",
            "Runtime": "python3.12",
        },
    )
    template.has_resource_properties(
        "AWS::Lambda::Function",
        {
            "FunctionName": "UpdateGrantFunction",
            "Handler": "update_grant.handler",
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

    methods = template.find_resources("AWS::ApiGateway::Method")
    delete_methods = [
        resource["Properties"]
        for resource in methods.values()
        if resource["Properties"].get("HttpMethod") == "DELETE"
    ]
    assert len(delete_methods) == 1
    assert delete_methods[0]["AuthorizationType"] == "COGNITO_USER_POOLS"
    assert "AuthorizerId" in delete_methods[0]

    put_methods = [
        resource["Properties"]
        for resource in methods.values()
        if resource["Properties"].get("HttpMethod") == "PUT"
    ]
    assert len(put_methods) == 1
    assert put_methods[0]["AuthorizationType"] == "COGNITO_USER_POOLS"
    assert "AuthorizerId" in put_methods[0]

    template.has_resource_properties(
        "AWS::ApiGateway::Resource",
        {
            "PathPart": "{id}",
        },
    )

    policies = template.find_resources("AWS::IAM::Policy")
    delete_policies = [
        resource["Properties"]["PolicyDocument"]["Statement"]
        for resource in policies.values()
        if resource["Properties"].get("PolicyName", "").startswith("DeleteGrantFunction")
    ]
    assert len(delete_policies) == 1
    delete_statement = delete_policies[0][0]
    assert delete_statement["Action"] == "dynamodb:DeleteItem"
    assert delete_statement["Effect"] == "Allow"
    assert delete_statement["Resource"]["Fn::GetAtt"][1] == "Arn"
    assert delete_statement["Resource"]["Fn::GetAtt"][0] in template.find_resources(
        "AWS::DynamoDB::Table"
    )

    update_policies = [
        resource["Properties"]["PolicyDocument"]["Statement"]
        for resource in policies.values()
        if resource["Properties"].get("PolicyName", "").startswith("UpdateGrantFunction")
    ]
    assert len(update_policies) == 1
    update_statement = update_policies[0][0]
    assert update_statement["Action"] == "dynamodb:UpdateItem"
    assert update_statement["Effect"] == "Allow"
    assert update_statement["Resource"]["Fn::GetAtt"][1] == "Arn"
    assert update_statement["Resource"]["Fn::GetAtt"][0] in template.find_resources(
        "AWS::DynamoDB::Table"
    )

    options_methods = [
        resource["Properties"]
        for resource in methods.values()
        if resource["Properties"].get("HttpMethod") == "OPTIONS"
    ]
    assert len(options_methods) == 3
    assert all(
        method["Integration"]["IntegrationResponses"][0]["ResponseParameters"][
            "method.response.header.Access-Control-Allow-Methods"
        ]
        == "'GET,POST,PUT,DELETE,OPTIONS'"
        for method in options_methods
    )
