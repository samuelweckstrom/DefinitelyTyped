import {
    APIGatewayAuthorizerResultContext,
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayEventRequestContextWithAuthorizer,
} from "../common/api-gateway";
import { Callback, Handler } from "../handler";

export type APIGatewayAuthorizerHandler = Handler<APIGatewayAuthorizerEvent, APIGatewayAuthorizerResult>;
export type APIGatewayAuthorizerWithContextHandler<TAuthorizerContext extends APIGatewayAuthorizerResultContext> =
    Handler<APIGatewayAuthorizerEvent, APIGatewayAuthorizerWithContextResult<TAuthorizerContext>>;

export type APIGatewayAuthorizerCallback = Callback<APIGatewayAuthorizerResult>;
export type APIGatewayAuthorizerWithContextCallback<TAuthorizerContext extends APIGatewayAuthorizerResultContext> =
    Callback<APIGatewayAuthorizerWithContextResult<TAuthorizerContext>>;

export type APIGatewayTokenAuthorizerHandler =
    Handler<APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult>;
export type APIGatewayTokenAuthorizerWithContextHandler<TAuthorizerContext extends APIGatewayAuthorizerResultContext> =
    Handler<APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerWithContextResult<TAuthorizerContext>>;

export type APIGatewayRequestAuthorizerHandler =
    Handler<APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerResult>;
export type APIGatewayRequestAuthorizerWithContextHandler<TAuthorizerContext extends APIGatewayAuthorizerResultContext> =
    Handler<APIGatewayRequestAuthorizerEvent, APIGatewayAuthorizerWithContextResult<TAuthorizerContext>>;

export type APIGatewayAuthorizerEvent = APIGatewayTokenAuthorizerEvent | APIGatewayRequestAuthorizerEvent;

export interface APIGatewayTokenAuthorizerEvent {
    type: "TOKEN";
    methodArn: string;
    authorizationToken: string;
}

// Note, when invoked by the tester in the AWS web console, the map values can be null,
// but they will be empty objects in the real object.
// Worse, it will include "body" and "isBase64Encoded" properties, unlike the real call!
export interface APIGatewayRequestAuthorizerEvent {
    type: "REQUEST";
    resource: string;
    path: string;
    httpMethod: string;
    headers: { [name: string]: string } | null;
    multiValueHeaders: { [name: string]: string[] } | null;
    pathParameters: { [name: string]: string } | null;
    queryStringParameters: { [name: string]: string } | null;
    multiValueQueryStringParameters: { [name: string]: string[] } | null;
    stageVariables: { [name: string]: string } | null;
    requestContext: APIGatewayEventRequestContextWithAuthorizer<undefined>;
    domainName: string;
    apiId: string;
}

export interface APIGatewayAuthorizerResult {
    principalId: string;
    policyDocument: PolicyDocument;
    context?: APIGatewayAuthorizerResultContext | null;
    usageIdentifierKey?: string | null;
}

// Separate type so the context property is required, without pulling complex type magic.
export interface APIGatewayAuthorizerWithContextResult<TAuthorizerContext extends APIGatewayAuthorizerResultContext> {
    principalId: string;
    policyDocument: PolicyDocument;
    context: TAuthorizerContext;
    usageIdentifierKey?: string | null;
}

// Legacy event / names

/** @deprecated Use APIGatewayAuthorizerHandler or a subtype */
export type CustomAuthorizerHandler = Handler<CustomAuthorizerEvent, APIGatewayAuthorizerResult>;

// This one is actually fine.
export type CustomAuthorizerCallback = APIGatewayAuthorizerCallback;

/** @deprecated Use APIGatewayAuthorizerEvent or a subtype */
export interface CustomAuthorizerEvent {
    type: string;
    methodArn: string;
    authorizationToken?: string;
    resource?: string;
    path?: string;
    httpMethod?: string;
    headers?: { [name: string]: string };
    multiValueHeaders?: { [name: string]: string[] };
    pathParameters?: { [name: string]: string } | null;
    queryStringParameters?: { [name: string]: string } | null;
    multiValueQueryStringParameters?: { [name: string]: string[] } | null;
    stageVariables?: { [name: string]: string };
    requestContext?: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>;
    domainName?: string;
    apiId?: string;
}

export type CustomAuthorizerResult = APIGatewayAuthorizerResult;
export type AuthResponse = APIGatewayAuthorizerResult;
export type AuthResponseContext = APIGatewayAuthorizerResultContext;

/**
 * API Gateway CustomAuthorizer AuthResponse.PolicyDocument.
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-output.html
 * https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
 */
export interface PolicyDocument {
    Version: string;
    Id?: string;
    Statement: Statement[];
}

/**
 * API Gateway CustomAuthorizer AuthResponse.PolicyDocument.Condition.
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-policy-language-overview.html
 * https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition.html
 */
export interface ConditionBlock {
    [condition: string]: Condition | Condition[];
}

export interface Condition {
    [key: string]: string | string[];
}

/**
 * API Gateway CustomAuthorizer AuthResponse.PolicyDocument.Statement.
 * https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-control-access-policy-language-overview.html
 * https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html
 */
export type Statement = BaseStatement & StatementAction & (StatementResource | StatementPrincipal);

export interface BaseStatement {
    Effect: string;
    Sid?: string;
    Condition?: ConditionBlock;
}

export type PrincipalValue = { [key: string]: string | string[] } | string | string[];
export interface MaybeStatementPrincipal {
    Principal?: PrincipalValue;
    NotPrincipal?: PrincipalValue;
}
export interface MaybeStatementResource {
    Resource?: string | string[];
    NotResource?: string | string[];
}
export type StatementAction = { Action: string | string[] } | { NotAction: string | string[] };
export type StatementResource = MaybeStatementPrincipal &
    ({ Resource: string | string[] } | { NotResource: string | string[] });
export type StatementPrincipal = MaybeStatementResource &
    ({ Principal: PrincipalValue } | { NotPrincipal: PrincipalValue });
