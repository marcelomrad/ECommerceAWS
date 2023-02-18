import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent, context: Context) : Promise<APIGatewayProxyResult> {

    //log da requisição da aws
    const lambdaRequestId = context.awsRequestId;
    //log da requisição da api
    const apiRquestId = event.requestContext.requestId;

    console.log("Lambda Request ID: " + lambdaRequestId + " - " + "API Request ID: " + apiRquestId);

    const method = event.httpMethod;

    if(event.resource === "/products"){
        if(method === 'GET'){
            console.log("GET Products - Success")

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "GET Products - Success"
                })
            }
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Bad Request"
        })
    }

}